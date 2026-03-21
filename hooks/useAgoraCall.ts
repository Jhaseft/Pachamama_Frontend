import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  createAgoraRtcEngine,
  IRtcEngine,
  IRtcEngineEventHandler,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';
import { getAgoraToken } from '../src/api/calls';
import { AGORA_APP_ID } from '../src/config';

async function requestPermissions(isVideo: boolean): Promise<boolean> {
  if (Platform.OS !== 'android') return true; // iOS pide sola al primer uso

  const perms: (keyof typeof PermissionsAndroid.PERMISSIONS)[] = ['RECORD_AUDIO'];
  if (isVideo) perms.push('CAMERA');

  const results = await PermissionsAndroid.requestMultiple(
    perms.map((p) => PermissionsAndroid.PERMISSIONS[p]),
  );

  const allGranted = perms.every(
    (p) => results[PermissionsAndroid.PERMISSIONS[p]] === PermissionsAndroid.RESULTS.GRANTED,
  );

  if (!allGranted) console.warn('[Agora] Permisos denegados:', results);
  return allGranted;
}

export type CallType = 'CALL' | 'VIDEO_CALL';

interface UseAgoraCallOptions {
  channelName: string;
  uid: number;
  isVideo: boolean;
  enabled: boolean;
}

export function useAgoraCall({ channelName, uid, isVideo, enabled }: UseAgoraCallOptions) {
  const engineRef   = useRef<IRtcEngine | null>(null);
  const handlerRef  = useRef<IRtcEngineEventHandler | null>(null);
  const cancelRef   = useRef(false);

  const [joined,     setJoined]     = useState(false);
  const [remoteUid,  setRemoteUid]  = useState<number | null>(null);
  const [muted,      setMuted]      = useState(false);
  const [cameraOff,  setCameraOff]  = useState(false);
  const [speakerOn,  setSpeakerOn]  = useState(isVideo); // video → speaker por defecto

  useEffect(() => {
    if (!enabled) return;
    cancelRef.current = false;
    void setup();
    return () => {
      cancelRef.current = true;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  async function setup() {
    try {
      const granted = await requestPermissions(isVideo);
      if (!granted) {
        console.warn('[Agora] Sin permisos, cancelando setup');
        return;
      }

      const engine = createAgoraRtcEngine();
      engineRef.current = engine;

      engine.initialize({
        appId: AGORA_APP_ID,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });

      // Guardar referencia al handler para poder desregistrarlo luego
      const handler: IRtcEngineEventHandler = {
        onJoinChannelSuccess: (connection) => {
          console.log('[Agora] Joined channel:', connection.channelId);
          setJoined(true);
        },
        onUserJoined: (_connection, rUid) => {
          console.log('[Agora] Remote user joined:', rUid);
          setRemoteUid(rUid);
        },
        onUserOffline: (_connection, rUid) => {
          console.log('[Agora] Remote user offline:', rUid);
          setRemoteUid(null);
        },
        onError: (err, msg) => {
          console.error('[Agora] Error', err, msg);
        },
      };
      handlerRef.current = handler;
      engine.registerEventHandler(handler);

      // Activar audio/video antes de unirse al canal
      engine.enableAudio();
      if (isVideo) {
        engine.enableVideo();
        engine.startPreview();
      }

      // Solicitar token al backend
      const { token } = await getAgoraToken(channelName, uid);

      // Si el efecto se limpió mientras esperábamos el token, liberar y salir
      if (cancelRef.current) {
        engine.release();
        engineRef.current = null;
        return;
      }

      engine.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        publishCameraTrack: isVideo,
        autoSubscribeAudio: true,
        autoSubscribeVideo: isVideo,
      });

      // Video → altavoz por defecto; voz → auricular por defecto
      engine.setEnableSpeakerphone(isVideo);
    } catch (e) {
      console.error('[Agora] Setup failed:', e);
    }
  }

  function teardown() {
    const engine = engineRef.current;
    if (!engine) return;

    if (handlerRef.current) {
      engine.unregisterEventHandler(handlerRef.current);
      handlerRef.current = null;
    }
    if (isVideo) engine.stopPreview();
    engine.leaveChannel();
    engine.release();
    engineRef.current = null;
    setJoined(false);
    setRemoteUid(null);
  }

  function toggleMute() {
    const next = !muted;
    engineRef.current?.muteLocalAudioStream(next);
    setMuted(next);
  }

  function toggleCamera() {
    const next = !cameraOff;
    engineRef.current?.muteLocalVideoStream(next);
    setCameraOff(next);
  }

  function switchCamera() {
    engineRef.current?.switchCamera();
  }

  function toggleSpeaker() {
    const next = !speakerOn;
    engineRef.current?.setEnableSpeakerphone(next);
    setSpeakerOn(next);
  }

  function leave() {
    cancelRef.current = true;
    teardown();
  }

  return { engine: engineRef.current, joined, remoteUid, muted, cameraOff, speakerOn, toggleMute, toggleCamera, switchCamera, toggleSpeaker, leave };
}
