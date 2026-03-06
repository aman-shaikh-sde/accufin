import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const useHeartbeat = () => {
  const { data: session } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Disabled: frequent heartbeats were overloading the server and causing timeouts.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      isActiveRef.current = false;
    };
  }, []);

  return null; // no-op
};

export default useHeartbeat;