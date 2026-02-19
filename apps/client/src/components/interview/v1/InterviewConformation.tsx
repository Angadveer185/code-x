import React from "react";
import axiosInstance from "@/utils/axiosInstance";
import { InterviewInfo } from "@/utils/type";
import { useColors } from "@/components/General/(Color Manager)/useColors";

interface fnHandler {
  isHost: boolean;
  interviewId: string;
  interviewData: React.Dispatch<React.SetStateAction<InterviewInfo | null>>;
  setConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
}

async function getToken(isHost: boolean, interviewId: string) {
  try {
    const role = isHost ? "host" : "guest";
    const channelId = interviewId;

    const data = await axiosInstance.post("/api/v1/interview/generate-token", {
      role,
      channelId,
    });

    return data.data;
  } catch (error) {
    console.log(error);
  }
}

function InterviewConformation(prop: fnHandler) {
  const theme = useColors();
  const handleClick = async () => {
    const data = await getToken(prop.isHost, prop.interviewId);
    prop.interviewData(data);
    prop.setConfirmed(true);
  };
  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center px-4 ${theme.background.secondary}`}
    >
      <div
        className={`w-full max-w-xl rounded-xl p-6 shadow-md ${theme.background.primary} ${theme.border.fadedThin}`}
      >
        <div className="mb-6 space-y-1">
          <p className={`text-sm ${theme.text.primary}`}>
            Interview ID: <span className="font-mono">{prop.interviewId}</span>
          </p>
        </div>

        <div className="flex gap-4">
          {prop.isHost ? (
            <button
              onClick={handleClick}
              className={`h-12 w-full rounded-lg font-medium ${theme.background.special} ${theme.text.inverted} ${theme.properties.interactiveButton}`}
            >
              Start Interview
            </button>
          ) : (
            <button
              className={`h-12 w-full rounded-lg font-medium ${theme.background.special} ${theme.text.inverted} ${theme.properties.interactiveButton}`}
            >
              Join Interview
            </button>
          )}
        </div>

        <p className={`mt-6 text-xs text-center ${theme.text.secondary}`}>
          {prop.isHost
            ? "You’re the host. Starting the interview will allow others to join."
            : "Wait for the host to start, then join when ready."}
        </p>
      </div>
    </div>
  );
}

export default InterviewConformation;
