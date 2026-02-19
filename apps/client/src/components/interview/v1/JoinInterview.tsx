import { InterviewInfo, InterviewMember } from "@/utils/type";
import InterviewConformation from "./InterviewConformation";
import { useState } from "react";
import InterviewCall from "./InterviewCall";

function JoinInterview(data: InterviewMember) {
  const [confirmed, setConfirmed] = useState(false);
  const [intervieweeData, setIntervieweeData] = useState<InterviewInfo | null>(
    null,
  );
  return (
    <>
      {!confirmed ? (
        <InterviewConformation
          interviewId={data.param.id}
          isHost={data.isHost}
          interviewData={setIntervieweeData}
          setConfirmed={setConfirmed}
        />
      ) : (
        <InterviewCall
          appId={intervieweeData?.appId || ""}
          channelName={data.param.id}
          token={intervieweeData?.token || ""}
          uid={intervieweeData?.uid || ""}
          containerUrl={intervieweeData?.containerUrl || ""}
        />
      )}
    </>
  );
}

export default JoinInterview;
