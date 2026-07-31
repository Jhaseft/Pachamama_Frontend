import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image,
  ActivityIndicator, Alert, Share, Linking, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/src/context/AuthContext';
import { apiUpdateMyProfile, type MyProfileData } from '@/src/api/anfitrionaProfile';
import { apiCreateGalleryImage } from '@/src/api/anfitrionaGallery';
import { apiUpsertServicePrice, type ServiceType } from '@/src/api/servicePrices';
import { loadOnboardingData, computeCompletion } from '@/src/lib/onboarding';

// ─── Paleta (mismos tonos que la web) ───────────────────────────────────────────
const C = {
  canvas: '#f6f3fb',
  card: '#ffffff',
  violet: '#7c3aed',
  violetSoft: '#f3e8ff',
  pink: '#ec4899',
  ink: '#1e1b2e',
  inkSoft: '#6b7280',
  inkFaint: '#9ca3af',
  line: '#e5e7eb',
  emerald: '#10b981',
};

const WHATSAPP_SUPPORT = '51987654321';

type Step = 'welcome' | 'profile' | 'services' | 'prices' | 'link' | 'share' | 'done' | 'help';

const META: Record<string, { n: number; pct: number }> = {
  profile: { n: 1, pct: 20 },
  services: { n: 2, pct: 40 },
  prices: { n: 3, pct: 60 },
  link: { n: 4, pct: 80 },
  share: { n: 5, pct: 100 },
};

type ServiceKey = 'MESSAGE_SEND' | 'CALL' | 'VIDEO_CALL';

const SERVICES: {
  key: ServiceKey; title: string; subtitle: string; unit: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap; colors: [string, string];
}[] = [
  { key: 'MESSAGE_SEND', title: 'Chat privado', subtitle: 'Chatea con tus seguidores', unit: 'por mensaje', icon: 'message-text', colors: [C.violet, C.pink] },
  { key: 'CALL', title: 'Llamadas', subtitle: 'Llamadas de voz', unit: 'por minuto', icon: 'phone', colors: ['#10b981', '#059669'] },
  { key: 'VIDEO_CALL', title: 'Videollamadas', subtitle: 'Videollamadas en vivo', unit: 'por minuto', icon: 'video', colors: [C.pink, '#db2777'] },
];

type Asset = ImagePicker.ImagePickerAsset;

// ─── Helpers de imágenes ────────────────────────────────────────────────────────
async function pickSingle(): Promise<Asset | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (res.canceled) return null;
  return res.assets[0];
}
async function pickMulti(): Promise<Asset[]> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: true });
  if (res.canceled) return [];
  return res.assets;
}
function toFile(a: Asset) {
  return {
    uri: a.uri,
    name: a.fileName || `upload_${Date.now()}.jpg`,
    type: a.mimeType || 'image/jpeg',
  };
}

async function copyLink(text: string) {
  await Clipboard.setStringAsync(text);
  Alert.alert('Enlace copiado', 'El enlace se copió al portapapeles.');
}
async function shareLink(text: string) {
  try {
    await Share.share({ title: 'Mi enlace de MonetizaLab', message: text, url: text });
  } catch {
    /* cancelado */
  }
}

// ─── Pantalla ────────────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isHydrated } = useAuth();

  const [step, setStep] = useState<Step>('welcome');
  const [helpReturn, setHelpReturn] = useState<Step>('welcome');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState<MyProfileData | null>(null);
  const [existingPublic, setExistingPublic] = useState(0);
  const [existingPremium, setExistingPremium] = useState(0);

  // Meta 1 — perfil
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarAsset, setAvatarAsset] = useState<Asset | null>(null);
  const [coverAsset, setCoverAsset] = useState<Asset | null>(null);
  const [publicAssets, setPublicAssets] = useState<Asset[]>([]);
  const [premiumAssets, setPremiumAssets] = useState<Asset[]>([]);
  const [premiumUnlock, setPremiumUnlock] = useState('10');

  // Metas 2-3 — servicios y precios
  const [enabled, setEnabled] = useState<Record<ServiceKey, boolean>>({
    MESSAGE_SEND: true, CALL: true, VIDEO_CALL: true,
  });
  const [prices, setPrices] = useState<Record<ServiceKey, string>>({
    MESSAGE_SEND: '', CALL: '', VIDEO_CALL: '',
  });

  // ── Carga inicial ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { router.replace('/(auth)/choose-access'); return; }
    if (user.role !== 'ANFITRIONA') { router.replace('/'); return; }
    (async () => {
      try {
        const data = await loadOnboardingData();
        const c = computeCompletion(data);
        setProfile(data.profile);
        setFirstName(data.profile.firstName ?? '');
        setLastName(data.profile.lastName ?? '');
        setBio(data.profile.bio ?? '');
        setExistingPublic(c.publicCount);
        setExistingPremium(c.premiumCount);
        const priceStr = (k: ServiceKey) => {
          const v = c.priceOf(k);
          return v == null ? '' : String(v);
        };
        setPrices({
          MESSAGE_SEND: priceStr('MESSAGE_SEND'),
          CALL: priceStr('CALL'),
          VIDEO_CALL: priceStr('VIDEO_CALL'),
        });
      } catch {
        setError('No se pudo cargar tu perfil. Reintenta.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, user?.role]);

  const totalPublic = existingPublic + publicAssets.length;
  const totalPremium = existingPremium + premiumAssets.length;

  const goHelp = () => { setHelpReturn(step); setStep('help'); };

  const back = () => {
    const order: Step[] = ['profile', 'services', 'prices', 'link', 'share'];
    const i = order.indexOf(step);
    if (i <= 0) setStep('welcome');
    else setStep(order[i - 1]);
  };

  const publicLink = profile ? `https://monetizalab.vip/@${profile.username}` : '';

  // ── Guardado Meta 1 ──────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setError('');
    if (!profile) return;
    if (!avatarAsset && !profile.avatarUrl) return setError('Sube tu foto de perfil.');
    if (!coverAsset && !profile.coverUrl) return setError('Sube tu foto de portada.');
    if (!bio.trim()) return setError('Escribe una breve información sobre ti.');
    const unlock = Number(premiumUnlock);
    if (premiumAssets.length > 0 && (!unlock || unlock <= 0))
      return setError('Define cuántos créditos cuesta desbloquear tus fotos exclusivas.');

    try {
      setSaving(true);
      await apiUpdateMyProfile(
        { firstName: firstName.trim(), lastName: lastName.trim(), username: profile.username, bio: bio.trim() },
        avatarAsset ? toFile(avatarAsset) : undefined,
        coverAsset ? toFile(coverAsset) : undefined,
      );
      for (const a of publicAssets) await apiCreateGalleryImage({ isPremium: false }, toFile(a));
      for (const a of premiumAssets) await apiCreateGalleryImage({ isPremium: true, unlockCredits: unlock }, toFile(a));

      setExistingPublic((n) => n + publicAssets.length);
      setExistingPremium((n) => n + premiumAssets.length);
      setPublicAssets([]); setPremiumAssets([]); setAvatarAsset(null); setCoverAsset(null);
      setStep('services');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar tu perfil.');
    } finally {
      setSaving(false);
    }
  };

  // ── Guardado Metas 2-3 ────────────────────────────────────────────────────────────
  const savePrices = async () => {
    setError('');
    const active = SERVICES.filter((s) => enabled[s.key]);
    if (active.length === 0) return setError('Activa al menos un servicio.');
    if (!enabled.MESSAGE_SEND) return setError('El chat privado es obligatorio.');
    for (const s of active) {
      const n = Number(prices[s.key]);
      if (prices[s.key].trim() === '' || isNaN(n) || n < 0)
        return setError(`Define un precio válido para "${s.title}" (0 = gratis).`);
    }
    try {
      setSaving(true);
      await Promise.all(active.map((s) => apiUpsertServicePrice(s.key as ServiceType, Number(prices[s.key]))));
      setStep('link');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar los precios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={C.violet} />
      </View>
    );
  }

  const showHeader = step !== 'welcome' && step !== 'done' && step !== 'help';

  return (
    <View style={{ flex: 1, backgroundColor: C.canvas }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>

          {showHeader && <Header meta={META[step]} onBack={back} onHelp={goHelp} />}

          {/* ── Bienvenida ── */}
          {step === 'welcome' && (
            <Welcome name={firstName || user?.firstName || ''} onStart={() => setStep('profile')} onHelp={goHelp} />
          )}

          {/* ── Meta 1: Perfil ── */}
          {step === 'profile' && (
            <Card>
              <StepTitle title="Completa tu perfil" subtitle="Tu perfil debe ser atractivo para que los usuarios quieran conocerte." />

              <FieldRow index={1} title="Foto de perfil" hint="Una foto clara donde se vea tu rostro." done={!!(avatarAsset || profile?.avatarUrl)}>
                <SingleImagePicker round preview={avatarAsset?.uri || profile?.avatarUrl || null} onPick={setAvatarAsset} />
              </FieldRow>

              <FieldRow index={2} title="Foto de portada" hint="Una imagen llamativa que represente tu estilo." done={!!(coverAsset || profile?.coverUrl)}>
                <SingleImagePicker wide preview={coverAsset?.uri || profile?.coverUrl || null} onPick={setCoverAsset} />
              </FieldRow>

              <FieldRow index={3} title="Galería de fotos (opcional)" hint="Muestra tu mejor contenido. Puedes agregarlas ahora o más tarde." done={totalPublic > 0}>
                <MultiImagePicker assets={publicAssets} onChange={setPublicAssets} />
                <Text style={{ marginTop: 6, fontSize: 12, fontWeight: '700', color: C.violet }}>
                  {totalPublic} foto{totalPublic === 1 ? '' : 's'} subida{totalPublic === 1 ? '' : 's'}
                </Text>
              </FieldRow>

              <FieldRow index={4} title="Fotos exclusivas (opcional)" hint="Fotos que solo verán tus clientes que paguen por ellas." done={totalPremium > 0}>
                <MultiImagePicker assets={premiumAssets} onChange={setPremiumAssets} premium />
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 12, color: C.inkSoft }}>Desbloqueo:</Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={premiumUnlock}
                    onChangeText={setPremiumUnlock}
                    style={{ width: 72, borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 13, color: C.ink }}
                  />
                  <Text style={{ fontSize: 12, color: C.inkSoft }}>créditos c/u</Text>
                </View>
                <Text style={{ marginTop: 6, fontSize: 12, fontWeight: '700', color: C.violet }}>
                  {totalPremium} foto{totalPremium === 1 ? '' : 's'} exclusiva{totalPremium === 1 ? '' : 's'}
                </Text>
              </FieldRow>

              <FieldRow index={5} title="Información básica" hint="Completa tu información para que te encuentren fácilmente." done={!!bio.trim()} last>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <TextInput placeholder="Nombre" placeholderTextColor={C.inkFaint} value={firstName} onChangeText={setFirstName}
                    style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: C.ink }} />
                  <TextInput placeholder="Apellido" placeholderTextColor={C.inkFaint} value={lastName} onChangeText={setLastName}
                    style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: C.ink }} />
                </View>
                <TextInput placeholder="Cuéntales algo sobre ti…" placeholderTextColor={C.inkFaint} value={bio} onChangeText={setBio}
                  multiline numberOfLines={3}
                  style={{ borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: C.ink, minHeight: 74, textAlignVertical: 'top' }} />
              </FieldRow>

              <PrimaryButton onPress={saveProfile} loading={saving} error={error}>Continuar</PrimaryButton>
            </Card>
          )}

          {/* ── Meta 2: Servicios ── */}
          {step === 'services' && (
            <Card>
              <StepTitle title="Activa tus servicios" subtitle="Elige los servicios que ofrecerás a tus clientes." />
              <View style={{ gap: 12 }}>
                {SERVICES.map((s) => (
                  <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.line, borderRadius: 16, backgroundColor: C.card, padding: 14 }}>
                    <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialCommunityIcons name={s.icon} size={20} color="white" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '800', color: C.ink, fontSize: 14 }}>{s.title}</Text>
                      <Text style={{ color: C.inkFaint, fontSize: 12 }}>{s.subtitle}</Text>
                    </View>
                    <Toggle on={enabled[s.key]} disabled={s.key === 'MESSAGE_SEND'} onToggle={() => setEnabled((e) => ({ ...e, [s.key]: !e[s.key] }))} />
                  </View>
                ))}
              </View>
              <PrimaryButton onPress={() => setStep('prices')}>Continuar</PrimaryButton>
            </Card>
          )}

          {/* ── Meta 3: Precios ── */}
          {step === 'prices' && (
            <Card>
              <StepTitle title="Configura tus precios" subtitle="Define cuánto cobrarás por cada servicio." />
              <View style={{ gap: 12 }}>
                {SERVICES.filter((s) => enabled[s.key]).map((s) => (
                  <View key={s.key} style={{ borderWidth: 1, borderColor: C.line, borderRadius: 16, backgroundColor: C.card, padding: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name={s.icon} size={18} color="white" />
                      </LinearGradient>
                      <Text style={{ fontWeight: '800', color: C.ink, fontSize: 14 }}>{s.title}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: C.inkSoft, fontSize: 13, fontWeight: '700' }}>Cr</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={prices[s.key]}
                        onChangeText={(t) => setPrices((p) => ({ ...p, [s.key]: t }))}
                        placeholder="0.00"
                        placeholderTextColor={C.inkFaint}
                        style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: C.ink, fontWeight: '700' }}
                      />
                      <Text style={{ color: C.inkFaint, fontSize: 12, width: 76, textAlign: 'right' }}>{s.unit}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, backgroundColor: C.violetSoft, paddingHorizontal: 12, paddingVertical: 10 }}>
                <MaterialCommunityIcons name="star-four-points" size={16} color={C.violet} style={{ marginTop: 1 }} />
                <Text style={{ flex: 1, fontSize: 12, color: C.inkSoft }}>Puedes cambiar estos precios cuando quieras.</Text>
              </View>
              <PrimaryButton onPress={savePrices} loading={saving} error={error}>Continuar</PrimaryButton>
            </Card>
          )}

          {/* ── Meta 4: Enlace ── */}
          {step === 'link' && (
            <Card>
              <StepTitle title="Obtén tu enlace" subtitle="Este es tu enlace personal de MonetizaLab." />
              <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 16, backgroundColor: C.card, padding: 20, alignItems: 'center' }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.violetSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <MaterialCommunityIcons name="link-variant" size={28} color={C.violet} />
                </View>
                <Text style={{ fontWeight: '900', color: C.violet, textAlign: 'center' }}>{publicLink}</Text>
                <Text style={{ marginTop: 8, fontSize: 12, color: C.inkSoft, textAlign: 'center' }}>
                  Tus seguidores podrán encontrarte y contactarte desde este enlace.
                </Text>
                <View style={{ marginTop: 16, width: '100%', gap: 8 }}>
                  <GradientButton icon="content-copy" label="Copiar enlace" onPress={() => copyLink(publicLink)} />
                  <OutlineButton icon="share-variant" label="Compartir enlace" onPress={() => shareLink(publicLink)} />
                </View>
              </View>
              <PrimaryButton onPress={() => setStep('share')}>Continuar</PrimaryButton>
            </Card>
          )}

          {/* ── Meta 5: Compartir ── */}
          {step === 'share' && (
            <Card>
              <StepTitle title="Comparte tu enlace" subtitle="Comparte tu enlace en tus redes sociales para empezar a recibir clientes." />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ShareBtn label="WhatsApp" color="#22c55e" icon="whatsapp" onPress={() => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(publicLink)}`)} />
                <ShareBtn label="Instagram" color="#e1306c" icon="instagram" onPress={() => copyLink(publicLink)} />
                <ShareBtn label="TikTok" color="#000000" icon="music-note" onPress={() => copyLink(publicLink)} />
                <ShareBtn label="Facebook" color="#2563eb" icon="facebook" onPress={() => Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}`)} />
              </View>
              <View style={{ marginTop: 16, gap: 8 }}>
                <GradientButton icon="share-variant" label="Compartir ahora" onPress={() => shareLink(publicLink)} />
                <OutlineButton icon="content-copy" label="Copiar enlace" onPress={() => copyLink(publicLink)} />
              </View>
              <PrimaryButton onPress={() => setStep('done')}>Continuar</PrimaryButton>
            </Card>
          )}

          {/* ── ¡Felicidades! ── */}
          {step === 'done' && (
            <Card center>
              <MaterialCommunityIcons name="party-popper" size={56} color={C.pink} style={{ alignSelf: 'center', marginBottom: 12 }} />
              <Text style={{ fontSize: 24, fontWeight: '900', color: C.ink, marginBottom: 4, textAlign: 'center' }}>¡Felicidades! 🎉</Text>
              <Text style={{ color: C.inkSoft, fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
                Tu perfil está listo y tu enlace ya está activo.
              </Text>
              <View style={{ alignSelf: 'center', gap: 8, marginBottom: 20 }}>
                {['Perfil completo', 'Servicios activados', 'Precios configurados', 'Enlace generado'].map((t) => (
                  <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.emerald, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialCommunityIcons name="check" size={13} color="white" />
                    </View>
                    <Text style={{ fontSize: 14, color: C.ink }}>{t}</Text>
                  </View>
                ))}
              </View>
              <View style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={{ fontSize: 13, color: '#92400e', textAlign: 'center' }}>
                  Ahora empieza a compartir tu enlace y recibe tus primeros clientes.
                </Text>
              </View>
              <PrimaryButton onPress={() => router.replace('/(anfitriona)')}>Ir a mi panel</PrimaryButton>
            </Card>
          )}

          {/* ── Ayuda ── */}
          {step === 'help' && (
            <Card>
              <TouchableOpacity onPress={() => setStep(helpReturn)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <MaterialCommunityIcons name="arrow-left" size={16} color={C.inkSoft} />
                <Text style={{ color: C.inkSoft, fontSize: 13 }}>Volver</Text>
              </TouchableOpacity>
              <MaterialCommunityIcons name="headphones" size={48} color={C.violet} style={{ alignSelf: 'center', marginBottom: 12 }} />
              <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: '900', color: C.ink, marginBottom: 4 }}>¿Necesitas ayuda?</Text>
              <Text style={{ textAlign: 'center', color: C.inkSoft, fontSize: 13, marginBottom: 20 }}>
                Estamos aquí para apoyarte en lo que necesites.
              </Text>
              <View style={{ gap: 12 }}>
                <HelpRow icon="book-open-variant" title="Centro de ayuda" subtitle="Resuelve tus dudas con nuestras preguntas frecuentes y guías." onPress={() => Linking.openURL('https://monetizalab.vip/soy-nuevo')} />
                <HelpRow icon="headphones" title="Hablar con un asesor" subtitle="Te atenderemos por WhatsApp en minutos." onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP_SUPPORT}`)} />
              </View>
              <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, backgroundColor: C.violetSoft, paddingHorizontal: 12, paddingVertical: 10 }}>
                <MaterialCommunityIcons name="star-four-points" size={16} color={C.violet} />
                <Text style={{ flex: 1, fontSize: 12, color: C.inkSoft }}>No te preocupes, tu progreso está guardado.</Text>
              </View>
            </Card>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

/* ───────────────────────── Subcomponentes ───────────────────────── */

function Header({ meta, onBack, onHelp }: { meta: { n: number; pct: number }; onBack: () => void; onHelp: () => void }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={16} color={C.inkSoft} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onHelp} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
          <MaterialCommunityIcons name="headphones" size={14} color={C.violet} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.violet }}>Soporte</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.ink }}>Meta {meta.n} de 5</Text>
        <Text style={{ fontSize: 13, color: C.inkSoft }}>{meta.pct}% completado</Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: C.line, overflow: 'hidden' }}>
        <LinearGradient colors={[C.pink, C.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: '100%', width: `${meta.pct}%`, borderRadius: 4 }} />
      </View>
    </View>
  );
}

function Welcome({ name, onStart, onHelp }: { name: string; onStart: () => void; onHelp: () => void }) {
  const items: { icon: keyof typeof MaterialCommunityIcons.glyphMap; text: string }[] = [
    { icon: 'account-group', text: 'Los usuarios te encuentran por tu enlace.' },
    { icon: 'message-text', text: 'Te escriben, te llaman o piden contenido.' },
    { icon: 'cash', text: 'Ganas dinero por cada interacción o venta.' },
    { icon: 'trending-up', text: 'Haces crecer tu comunidad y tus ingresos.' },
  ];
  return (
    <Card>
      <View style={{ alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={onHelp} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
          <MaterialCommunityIcons name="headphones" size={14} color={C.violet} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.violet }}>Soporte</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: '900', color: C.ink, marginTop: 8, marginBottom: 16 }}>
        Monetiza<Text style={{ color: C.violet }}>Lab</Text>
      </Text>
      <Text style={{ textAlign: 'center', fontSize: 28, fontWeight: '900', color: C.ink, marginBottom: 8 }}>
        ¡Bienvenida{name ? `, ${name}` : ''}! 👋
      </Text>
      <Text style={{ textAlign: 'center', color: C.inkSoft, fontSize: 13 }}>Estás a pasos de comenzar a monetizar tu comunidad.</Text>
      <Text style={{ textAlign: 'center', color: C.inkSoft, fontSize: 13, marginBottom: 20 }}>Te guiaremos paso a paso para dejar tu perfil listo.</Text>
      <View style={{ gap: 8, marginBottom: 20 }}>
        {items.map((it) => (
          <View key={it.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, backgroundColor: C.violetSoft, paddingHorizontal: 12, paddingVertical: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name={it.icon} size={16} color={C.violet} />
            </View>
            <Text style={{ flex: 1, fontSize: 13, color: C.inkSoft }}>{it.text}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton onPress={onStart}>Comenzar</PrimaryButton>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        <MaterialCommunityIcons name="check" size={14} color={C.emerald} />
        <Text style={{ fontSize: 12, color: C.emerald }}>Es rápido, fácil y 100% seguro</Text>
      </View>
    </Card>
  );
}

function Card({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <View style={{ borderRadius: 26, backgroundColor: C.card, padding: 24, borderWidth: 1, borderColor: C.line, shadowColor: C.violet, shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3, ...(center ? { alignItems: 'stretch' } : {}) }}>
      {children}
    </View>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ alignItems: 'center', marginBottom: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: '900', color: C.ink, marginBottom: 4, textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: C.inkSoft, fontSize: 13, textAlign: 'center' }}>{subtitle}</Text>
    </View>
  );
}

function FieldRow({ index, title, hint, done, children, last }: { index: number; title: string; hint: string; done: boolean; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line, paddingBottom: last ? 0 : 20, marginBottom: last ? 0 : 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', color: C.ink, fontSize: 14 }}>{index}. {title}</Text>
          <Text style={{ color: C.inkFaint, fontSize: 12 }}>{hint}</Text>
        </View>
        {done && (
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.emerald, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="check" size={15} color="white" />
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

function SingleImagePicker({ preview, onPick, round, wide }: { preview: string | null; onPick: (a: Asset) => void; round?: boolean; wide?: boolean }) {
  const size = round ? { width: 80, height: 80, borderRadius: 40 } : { width: '100%' as const, height: 112, borderRadius: 16 };
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={async () => { const a = await pickSingle(); if (a) onPick(a); }}
      style={{ overflow: 'hidden', borderWidth: 2, borderStyle: 'dashed', borderColor: C.line, backgroundColor: C.violetSoft, alignItems: 'center', justifyContent: 'center', ...size }}
    >
      {preview ? (
        <Image source={{ uri: preview }} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
      ) : round ? (
        <MaterialCommunityIcons name="camera" size={24} color={C.violet} />
      ) : (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="image-outline" size={24} color={C.violet} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.violet }}>Subir imagen</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function MultiImagePicker({ assets, onChange, premium }: { assets: Asset[]; onChange: (a: Asset[]) => void; premium?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {assets.map((a, i) => (
        <View key={a.assetId ?? a.uri ?? i} style={{ width: '22%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.line }}>
          <Image source={{ uri: a.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <TouchableOpacity onPress={() => onChange(assets.filter((_, idx) => idx !== i))}
            style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="close" size={13} color="white" />
          </TouchableOpacity>
          {premium && (
            <View style={{ position: 'absolute', bottom: 2, left: 2, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: 2 }}>
              <MaterialCommunityIcons name="lock" size={12} color="white" />
            </View>
          )}
        </View>
      ))}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={async () => { const picked = await pickMulti(); if (picked.length) onChange([...assets, ...picked]); }}
        style={{ width: '22%', aspectRatio: 1, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: C.line, backgroundColor: C.violetSoft, alignItems: 'center', justifyContent: 'center' }}
      >
        <MaterialCommunityIcons name="plus" size={24} color={C.violet} />
      </TouchableOpacity>
    </View>
  );
}

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={disabled ? undefined : onToggle}
      style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: on ? C.violet : C.line, opacity: disabled ? 0.7 : 1, justifyContent: 'center' }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', marginLeft: on ? 22 : 2 }} />
    </TouchableOpacity>
  );
}

function ShareBtn({ label, color, icon, onPress }: { label: string; color: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name={icon} size={22} color="white" />
      </View>
      <Text style={{ fontSize: 11, color: C.inkSoft }}>{label}</Text>
    </TouchableOpacity>
  );
}

function HelpRow({ icon, title, subtitle, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; subtitle: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, borderRadius: 16, padding: 14 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.violetSoft, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name={icon} size={20} color={C.violet} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', color: C.ink, fontSize: 14 }}>{title}</Text>
        <Text style={{ color: C.inkFaint, fontSize: 12 }}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={C.inkFaint} />
    </TouchableOpacity>
  );
}

function GradientButton({ icon, label, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient colors={[C.pink, C.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 12 }}>
        <MaterialCommunityIcons name={icon} size={16} color="white" />
        <Text style={{ color: 'white', fontWeight: '800' }}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function OutlineButton({ icon, label, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: 1, borderColor: C.line, paddingVertical: 12 }}>
      <MaterialCommunityIcons name={icon} size={16} color={C.ink} />
      <Text style={{ color: C.ink, fontWeight: '800' }}>{label}</Text>
    </TouchableOpacity>
  );
}

function PrimaryButton({ children, onPress, loading, error }: { children: React.ReactNode; onPress: () => void; loading?: boolean; error?: string }) {
  return (
    <View>
      <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.9} style={{ marginTop: 24, opacity: loading ? 0.5 : 1 }}>
        <LinearGradient colors={[C.pink, C.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 14 }}>
          {loading && <ActivityIndicator size="small" color="white" />}
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>{children}</Text>
        </LinearGradient>
      </TouchableOpacity>
      {!!error && (
        <View style={{ marginTop: 12, borderRadius: 12, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ fontSize: 13, color: '#b91c1c', textAlign: 'center' }}>{error}</Text>
        </View>
      )}
    </View>
  );
}
