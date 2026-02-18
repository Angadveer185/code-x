import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";

type Props = {
  appId: string;
  channelName: string;
  token: string;
  uid: string | number;
};

export default function InterviewCall({
  appId,
  channelName,
  token,
  uid,
}: Props) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);

  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);

  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const init = async () => {
      const client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      clientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          const remoteContainer = document.createElement("div");
          remoteContainer.id = `remote-${user.uid}`;
          remoteContainer.style.width = "100%";
          remoteContainer.style.height = "100%";

          document
            .getElementById("remote-container")
            ?.appendChild(remoteContainer);

          user.videoTrack?.play(remoteContainer);
        }

        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (user) => {
        const el = document.getElementById(`remote-${user.uid}`);
        el?.remove();
      });

      await client.join(appId, channelName, token, uid);

      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      videoTrack.play(localVideoRef.current!);

      await client.publish([audioTrack, videoTrack]);

      setJoined(true);
    };

    init();

    return () => {
      leaveCall();
    };
  }, []);

  const leaveCall = async () => {
    if (!clientRef.current) return;

    localAudioTrack?.stop();
    localAudioTrack?.close();

    localVideoTrack?.stop();
    localVideoTrack?.close();

    await clientRef.current.leave();
    clientRef.current.removeAllListeners();

    setJoined(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Interview Call</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          height: 400,
        }}
      >
        {/* Local video */}
        <div
          ref={localVideoRef}
          style={{ background: "#000", borderRadius: 8 }}
        />

        {/* Remote videos */}
        <div
          id="remote-container"
          style={{ background: "#111", borderRadius: 8 }}
        />
      </div>

      {joined && (
        <button onClick={leaveCall} style={{ marginTop: 16 }}>
          Leave Interview
        </button>
      )}
    </div>
  );
}
