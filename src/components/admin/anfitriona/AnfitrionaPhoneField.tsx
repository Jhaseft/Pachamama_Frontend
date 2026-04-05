import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const COUNTRY_CODES = [
    { flag: '🇦🇫', name: 'Afganistán',              code: '+93'   },
    { flag: '🇦🇱', name: 'Albania',                  code: '+355'  },
    { flag: '🇩🇿', name: 'Argelia',                  code: '+213'  },
    { flag: '🇦🇩', name: 'Andorra',                  code: '+376'  },
    { flag: '🇦🇴', name: 'Angola',                   code: '+244'  },
    { flag: '🇦🇬', name: 'Antigua y Barbuda',        code: '+1268' },
    { flag: '🇸🇦', name: 'Arabia Saudita',           code: '+966'  },
    { flag: '🇦🇷', name: 'Argentina',                code: '+54'   },
    { flag: '🇦🇲', name: 'Armenia',                  code: '+374'  },
    { flag: '🇦🇺', name: 'Australia',                code: '+61'   },
    { flag: '🇦🇹', name: 'Austria',                  code: '+43'   },
    { flag: '🇦🇿', name: 'Azerbaiyán',               code: '+994'  },
    { flag: '🇧🇸', name: 'Bahamas',                  code: '+1242' },
    { flag: '🇧🇭', name: 'Baréin',                   code: '+973'  },
    { flag: '🇧🇩', name: 'Bangladés',                code: '+880'  },
    { flag: '🇧🇧', name: 'Barbados',                 code: '+1246' },
    { flag: '🇧🇾', name: 'Bielorrusia',              code: '+375'  },
    { flag: '🇧🇪', name: 'Bélgica',                  code: '+32'   },
    { flag: '🇧🇿', name: 'Belice',                   code: '+501'  },
    { flag: '🇧🇯', name: 'Benín',                    code: '+229'  },
    { flag: '🇧🇹', name: 'Bután',                    code: '+975'  },
    { flag: '🇧🇴', name: 'Bolivia',                  code: '+591'  },
    { flag: '🇧🇦', name: 'Bosnia y Herzegovina',     code: '+387'  },
    { flag: '🇧🇼', name: 'Botsuana',                 code: '+267'  },
    { flag: '🇧🇷', name: 'Brasil',                   code: '+55'   },
    { flag: '🇧🇳', name: 'Brunéi',                   code: '+673'  },
    { flag: '🇧🇬', name: 'Bulgaria',                 code: '+359'  },
    { flag: '🇧🇫', name: 'Burkina Faso',             code: '+226'  },
    { flag: '🇧🇮', name: 'Burundi',                  code: '+257'  },
    { flag: '🇨🇻', name: 'Cabo Verde',               code: '+238'  },
    { flag: '🇰🇭', name: 'Camboya',                  code: '+855'  },
    { flag: '🇨🇲', name: 'Camerún',                  code: '+237'  },
    { flag: '🇨🇦', name: 'Canadá',                   code: '+1'    },
    { flag: '🇶🇦', name: 'Catar',                    code: '+974'  },
    { flag: '🇹🇩', name: 'Chad',                     code: '+235'  },
    { flag: '🇨🇱', name: 'Chile',                    code: '+56'   },
    { flag: '🇨🇳', name: 'China',                    code: '+86'   },
    { flag: '🇨🇾', name: 'Chipre',                   code: '+357'  },
    { flag: '🇨🇴', name: 'Colombia',                 code: '+57'   },
    { flag: '🇰🇲', name: 'Comoras',                  code: '+269'  },
    { flag: '🇨🇬', name: 'Congo',                    code: '+242'  },
    { flag: '🇨🇩', name: 'Congo (RDC)',              code: '+243'  },
    { flag: '🇰🇵', name: 'Corea del Norte',          code: '+850'  },
    { flag: '🇰🇷', name: 'Corea del Sur',            code: '+82'   },
    { flag: '🇨🇷', name: 'Costa Rica',               code: '+506'  },
    { flag: '🇨🇮', name: 'Costa de Marfil',          code: '+225'  },
    { flag: '🇭🇷', name: 'Croacia',                  code: '+385'  },
    { flag: '🇨🇺', name: 'Cuba',                     code: '+53'   },
    { flag: '🇩🇰', name: 'Dinamarca',                code: '+45'   },
    { flag: '🇩🇯', name: 'Yibuti',                   code: '+253'  },
    { flag: '🇩🇲', name: 'Dominica',                 code: '+1767' },
    { flag: '🇩🇴', name: 'Rep. Dominicana',          code: '+1809' },
    { flag: '🇪🇨', name: 'Ecuador',                  code: '+593'  },
    { flag: '🇪🇬', name: 'Egipto',                   code: '+20'   },
    { flag: '🇸🇻', name: 'El Salvador',              code: '+503'  },
    { flag: '🇦🇪', name: 'Emiratos Árabes Unidos',   code: '+971'  },
    { flag: '🇪🇷', name: 'Eritrea',                  code: '+291'  },
    { flag: '🇸🇰', name: 'Eslovaquia',               code: '+421'  },
    { flag: '🇸🇮', name: 'Eslovenia',                code: '+386'  },
    { flag: '🇪🇸', name: 'España',                   code: '+34'   },
    { flag: '🇺🇸', name: 'Estados Unidos',           code: '+1'    },
    { flag: '🇪🇪', name: 'Estonia',                  code: '+372'  },
    { flag: '🇸🇿', name: 'Esuatini',                 code: '+268'  },
    { flag: '🇪🇹', name: 'Etiopía',                  code: '+251'  },
    { flag: '🇵🇭', name: 'Filipinas',                code: '+63'   },
    { flag: '🇫🇮', name: 'Finlandia',                code: '+358'  },
    { flag: '🇫🇯', name: 'Fiyi',                     code: '+679'  },
    { flag: '🇫🇷', name: 'Francia',                  code: '+33'   },
    { flag: '🇬🇦', name: 'Gabón',                    code: '+241'  },
    { flag: '🇬🇲', name: 'Gambia',                   code: '+220'  },
    { flag: '🇬🇪', name: 'Georgia',                  code: '+995'  },
    { flag: '🇬🇭', name: 'Ghana',                    code: '+233'  },
    { flag: '🇬🇩', name: 'Granada',                  code: '+1473' },
    { flag: '🇬🇷', name: 'Grecia',                   code: '+30'   },
    { flag: '🇬🇹', name: 'Guatemala',                code: '+502'  },
    { flag: '🇬🇳', name: 'Guinea',                   code: '+224'  },
    { flag: '🇬🇼', name: 'Guinea-Bisáu',             code: '+245'  },
    { flag: '🇬🇶', name: 'Guinea Ecuatorial',        code: '+240'  },
    { flag: '🇬🇾', name: 'Guyana',                   code: '+592'  },
    { flag: '🇭🇹', name: 'Haití',                    code: '+509'  },
    { flag: '🇭🇳', name: 'Honduras',                 code: '+504'  },
    { flag: '🇭🇺', name: 'Hungría',                  code: '+36'   },
    { flag: '🇮🇳', name: 'India',                    code: '+91'   },
    { flag: '🇮🇩', name: 'Indonesia',                code: '+62'   },
    { flag: '🇮🇶', name: 'Irak',                     code: '+964'  },
    { flag: '🇮🇷', name: 'Irán',                     code: '+98'   },
    { flag: '🇮🇪', name: 'Irlanda',                  code: '+353'  },
    { flag: '🇮🇸', name: 'Islandia',                 code: '+354'  },
    { flag: '🇮🇱', name: 'Israel',                   code: '+972'  },
    { flag: '🇮🇹', name: 'Italia',                   code: '+39'   },
    { flag: '🇯🇲', name: 'Jamaica',                  code: '+1876' },
    { flag: '🇯🇵', name: 'Japón',                    code: '+81'   },
    { flag: '🇯🇴', name: 'Jordania',                 code: '+962'  },
    { flag: '🇰🇿', name: 'Kazajistán',               code: '+7'    },
    { flag: '🇰🇪', name: 'Kenia',                    code: '+254'  },
    { flag: '🇰🇬', name: 'Kirguistán',               code: '+996'  },
    { flag: '🇰🇮', name: 'Kiribati',                 code: '+686'  },
    { flag: '🇽🇰', name: 'Kosovo',                   code: '+383'  },
    { flag: '🇰🇼', name: 'Kuwait',                   code: '+965'  },
    { flag: '🇱🇦', name: 'Laos',                     code: '+856'  },
    { flag: '🇱🇸', name: 'Lesoto',                   code: '+266'  },
    { flag: '🇱🇻', name: 'Letonia',                  code: '+371'  },
    { flag: '🇱🇧', name: 'Líbano',                   code: '+961'  },
    { flag: '🇱🇷', name: 'Liberia',                  code: '+231'  },
    { flag: '🇱🇾', name: 'Libia',                    code: '+218'  },
    { flag: '🇱🇮', name: 'Liechtenstein',            code: '+423'  },
    { flag: '🇱🇹', name: 'Lituania',                 code: '+370'  },
    { flag: '🇱🇺', name: 'Luxemburgo',               code: '+352'  },
    { flag: '🇲🇰', name: 'Macedonia del Norte',      code: '+389'  },
    { flag: '🇲🇬', name: 'Madagascar',               code: '+261'  },
    { flag: '🇲🇾', name: 'Malasia',                  code: '+60'   },
    { flag: '🇲🇼', name: 'Malaui',                   code: '+265'  },
    { flag: '🇲🇻', name: 'Maldivas',                 code: '+960'  },
    { flag: '🇲🇱', name: 'Malí',                     code: '+223'  },
    { flag: '🇲🇹', name: 'Malta',                    code: '+356'  },
    { flag: '🇲🇦', name: 'Marruecos',                code: '+212'  },
    { flag: '🇲🇭', name: 'Islas Marshall',           code: '+692'  },
    { flag: '🇲🇷', name: 'Mauritania',               code: '+222'  },
    { flag: '🇲🇺', name: 'Mauricio',                 code: '+230'  },
    { flag: '🇲🇽', name: 'México',                   code: '+52'   },
    { flag: '🇫🇲', name: 'Micronesia',               code: '+691'  },
    { flag: '🇲🇩', name: 'Moldavia',                 code: '+373'  },
    { flag: '🇲🇨', name: 'Mónaco',                   code: '+377'  },
    { flag: '🇲🇳', name: 'Mongolia',                 code: '+976'  },
    { flag: '🇲🇪', name: 'Montenegro',               code: '+382'  },
    { flag: '🇲🇿', name: 'Mozambique',               code: '+258'  },
    { flag: '🇲🇲', name: 'Myanmar',                  code: '+95'   },
    { flag: '🇳🇦', name: 'Namibia',                  code: '+264'  },
    { flag: '🇳🇷', name: 'Nauru',                    code: '+674'  },
    { flag: '🇳🇵', name: 'Nepal',                    code: '+977'  },
    { flag: '🇳🇮', name: 'Nicaragua',                code: '+505'  },
    { flag: '🇳🇪', name: 'Níger',                    code: '+227'  },
    { flag: '🇳🇬', name: 'Nigeria',                  code: '+234'  },
    { flag: '🇳🇴', name: 'Noruega',                  code: '+47'   },
    { flag: '🇳🇿', name: 'Nueva Zelanda',            code: '+64'   },
    { flag: '🇴🇲', name: 'Omán',                     code: '+968'  },
    { flag: '🇵🇰', name: 'Pakistán',                 code: '+92'   },
    { flag: '🇵🇼', name: 'Palaos',                   code: '+680'  },
    { flag: '🇵🇸', name: 'Palestina',                code: '+970'  },
    { flag: '🇵🇦', name: 'Panamá',                   code: '+507'  },
    { flag: '🇵🇬', name: 'Papúa Nueva Guinea',       code: '+675'  },
    { flag: '🇵🇾', name: 'Paraguay',                 code: '+595'  },
    { flag: '🇵🇪', name: 'Perú',                     code: '+51'   },
    { flag: '🇵🇱', name: 'Polonia',                  code: '+48'   },
    { flag: '🇵🇹', name: 'Portugal',                 code: '+351'  },
    { flag: '🇵🇷', name: 'Puerto Rico',              code: '+1787' },
    { flag: '🇬🇧', name: 'Reino Unido',              code: '+44'   },
    { flag: '🇨🇫', name: 'Rep. Centroafricana',      code: '+236'  },
    { flag: '🇨🇿', name: 'Rep. Checa',               code: '+420'  },
    { flag: '🇷🇴', name: 'Rumanía',                  code: '+40'   },
    { flag: '🇷🇼', name: 'Ruanda',                   code: '+250'  },
    { flag: '🇷🇺', name: 'Rusia',                    code: '+7'    },
    { flag: '🇼🇸', name: 'Samoa',                    code: '+685'  },
    { flag: '🇸🇲', name: 'San Marino',               code: '+378'  },
    { flag: '🇸🇹', name: 'Santo Tomé y Príncipe',    code: '+239'  },
    { flag: '🇸🇳', name: 'Senegal',                  code: '+221'  },
    { flag: '🇷🇸', name: 'Serbia',                   code: '+381'  },
    { flag: '🇸🇨', name: 'Seychelles',               code: '+248'  },
    { flag: '🇸🇱', name: 'Sierra Leona',             code: '+232'  },
    { flag: '🇸🇬', name: 'Singapur',                 code: '+65'   },
    { flag: '🇸🇾', name: 'Siria',                    code: '+963'  },
    { flag: '🇸🇴', name: 'Somalia',                  code: '+252'  },
    { flag: '🇱🇰', name: 'Sri Lanka',                code: '+94'   },
    { flag: '🇰🇳', name: 'San Cristóbal y Nieves',   code: '+1869' },
    { flag: '🇱🇨', name: 'Santa Lucía',              code: '+1758' },
    { flag: '🇻🇨', name: 'San Vicente y Granadinas', code: '+1784' },
    { flag: '🇸🇩', name: 'Sudán',                    code: '+249'  },
    { flag: '🇸🇸', name: 'Sudán del Sur',            code: '+211'  },
    { flag: '🇸🇪', name: 'Suecia',                   code: '+46'   },
    { flag: '🇨🇭', name: 'Suiza',                    code: '+41'   },
    { flag: '🇸🇷', name: 'Surinam',                  code: '+597'  },
    { flag: '🇹🇭', name: 'Tailandia',                code: '+66'   },
    { flag: '🇹🇿', name: 'Tanzania',                 code: '+255'  },
    { flag: '🇹🇯', name: 'Tayikistán',               code: '+992'  },
    { flag: '🇹🇱', name: 'Timor Oriental',           code: '+670'  },
    { flag: '🇹🇬', name: 'Togo',                     code: '+228'  },
    { flag: '🇹🇴', name: 'Tonga',                    code: '+676'  },
    { flag: '🇹🇹', name: 'Trinidad y Tobago',        code: '+1868' },
    { flag: '🇹🇳', name: 'Túnez',                    code: '+216'  },
    { flag: '🇹🇲', name: 'Turkmenistán',             code: '+993'  },
    { flag: '🇹🇷', name: 'Turquía',                  code: '+90'   },
    { flag: '🇹🇻', name: 'Tuvalu',                   code: '+688'  },
    { flag: '🇺🇦', name: 'Ucrania',                  code: '+380'  },
    { flag: '🇺🇬', name: 'Uganda',                   code: '+256'  },
    { flag: '🇺🇾', name: 'Uruguay',                  code: '+598'  },
    { flag: '🇺🇿', name: 'Uzbekistán',               code: '+998'  },
    { flag: '🇻🇺', name: 'Vanuatu',                  code: '+678'  },
    { flag: '🇻🇦', name: 'Vaticano',                 code: '+379'  },
    { flag: '🇻🇪', name: 'Venezuela',                code: '+58'   },
    { flag: '🇻🇳', name: 'Vietnam',                  code: '+84'   },
    { flag: '🇾🇪', name: 'Yemen',                    code: '+967'  },
    { flag: '🇿🇲', name: 'Zambia',                   code: '+260'  },
    { flag: '🇿🇼', name: 'Zimbabue',                 code: '+263'  },
];

// Keep old export name for backward compatibility
export const LATAM_CODES = COUNTRY_CODES;

export function parsePhone(full: string) {
    const normalized = full.startsWith('+') ? full : '+' + full;
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    const match = sorted.find(c => normalized.startsWith(c.code));
    if (match) return { code: match.code, number: normalized.slice(match.code.length) };
    return { code: '+1', number: full };
}

interface Props {
    editing: boolean;
    countryCode: string;
    phoneNumber: string;
    onChangeCode: (code: string) => void;
    onChangeNumber: (number: string) => void;
}

export default function AnfitrionaPhoneField({ editing, countryCode, phoneNumber, onChangeCode, onChangeNumber }: Props) {
    const [showPicker, setShowPicker] = useState(false);
    const [search, setSearch] = useState('');

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode && c.name !== 'Rusia') 
        ?? COUNTRY_CODES.find(c => c.code === countryCode) 
        ?? COUNTRY_CODES[0];

    const filtered = search.trim()
        ? COUNTRY_CODES.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.includes(search)
          )
        : COUNTRY_CODES;

    return (
        <>
            <View className="flex-row items-center px-4 py-4 gap-3 border-b border-zinc-800">
                <View className="w-9 h-9 rounded-xl bg-[#1a0505] items-center justify-center">
                    <MaterialCommunityIcons name="phone-outline" size={18} color="#A11B1B" />
                </View>
                <View className="flex-1">
                    <Text className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Teléfono</Text>
                    {editing ? (
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                                onPress={() => { setSearch(''); setShowPicker(true); }}
                                className="flex-row items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1"
                            >
                                <Text style={{ fontSize: 18 }}>{selectedCountry.flag}</Text>
                                <Text className="text-white text-sm font-bold">{countryCode}</Text>
                                <MaterialCommunityIcons name="chevron-down" size={14} color="#9ca3af" />
                            </TouchableOpacity>
                            <TextInput
                                value={phoneNumber}
                                onChangeText={onChangeNumber}
                                keyboardType="phone-pad"
                                className="flex-1 text-white text-[15px] font-semibold"
                                style={{ borderBottomWidth: 1, borderBottomColor: '#A11B1B', paddingVertical: 4 }}
                                placeholderTextColor="#52525b"
                                placeholder="71234567"
                            />
                        </View>
                    ) : (
                        <Text className="text-white text-[15px] font-semibold">
                            {countryCode} {phoneNumber || '—'}
                        </Text>
                    )}
                </View>
            </View>

            <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                    <View style={{ backgroundColor: '#1a1a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center px-5 py-4 border-b border-zinc-800">
                            <Text className="text-white font-bold text-base">Código de país</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <MaterialCommunityIcons name="close" size={22} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        {/* Search — fijo, no scrollea */}
                        <View className="px-4 py-3 border-b border-zinc-800">
                            <View className="flex-row items-center bg-zinc-800 rounded-xl px-3 gap-2">
                                <MaterialCommunityIcons name="magnify" size={18} color="#71717a" />
                                <TextInput
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Buscar país o código..."
                                    placeholderTextColor="#52525b"
                                    autoCorrect={false}
                                    style={{ flex: 1, color: 'white', fontSize: 14, paddingVertical: 10 }}
                                />
                                {search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch('')}>
                                        <MaterialCommunityIcons name="close-circle" size={16} color="#71717a" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        {/* Lista */}
                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => item.name}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingBottom: 24 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => { onChangeCode(item.code); setShowPicker(false); }}
                                    className="flex-row items-center px-5 py-3 border-b border-zinc-800/40"
                                    style={item.code === countryCode ? { backgroundColor: '#1a0505' } : undefined}
                                >
                                    <Text style={{ fontSize: 22, marginRight: 12 }}>{item.flag}</Text>
                                    <Text className="text-white flex-1 text-sm">{item.name}</Text>
                                    <Text className="text-zinc-400 text-sm font-bold">{item.code}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}
