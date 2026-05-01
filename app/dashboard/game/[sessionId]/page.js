"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";

// NEW: hooks
import { useWebcam } from "@/lib/hooks/useWebcam";
import { useWebRTC } from "@/lib/hooks/useWebRTC";

// Checkout suggestion map
const CHECKOUTS = {
  170: "T20 T20 Bull",
  167: "T20 T19 Bull",
  164: "T20 T18 Bull",
  161: "T20 T17 Bull",
  160: "T20 T20 D20",
  158: "T20 T20 D19",
  157: "T20 T19 D20",
  156: "T20 T20 D18",
  155: "T20 T19 D19",
  154: "T20 T18 D20",
  153: "T20 T19 D18",
  152: "T20 T20 D16",
  151: "T20 T17 D20",
  150: "T20 T18 D18",
  149: "T20 T19 D16",
  148: "T20 T16 D20",
  147: "T20 T17 D18",
  146: "T20 T18 D16",
  145: "T20 T15 D20",
  144: "T20 T20 D12",
  141: "T20 T19 D12",
  140: "T20 T20 D10",
  100: "T20 D20",
  80: "T20 D10",
  40: "D20",
  32: "D16",
  24: "D12",
  16: "D8",
  8: "D4",
};

function getCheckoutSuggestion(remaining) {
  if (remaining > 170 || remaining < 2) return "";
  return CHECKOUTS[remaining] || "No standard route — set up.";
}

export default function GameRoom() {
  const supabase = createClientBrowser();
  const { sessionId } = useParams();

  const callStartedRef = useRef(false);
  const remoteVideoRef = useRef(null);

  const [session, setSession] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [currentUserPlayerId, setCurrentUserPlayerId] = useState(null);

  const [input, setInput] = useState("");
  const [matchFinished, setMatchFinished] = useState(false);

  const [legWinPlayerId, setLegWinPlayerId] = useState(null);
  const [legOverlay, setLegOverlay] = useState(null);

  const [showMatchSummary, setShowMatchSummary] = useState(false);

  // NEW: local webcam
  const { stream: localStream, videoRef: localVideoRef } = useWebcam();

  useEffect(() => {
    console.log("[GameRoom] sessionId =", sessionId);
    console.log("[GameRoom] localStream =", localStream);
  }, [sessionId, localStream]);

  // ⭐ BIND LOCAL STREAM TO VIDEO (IMPORTANT)
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // 1) LOAD SESSION + CURRENT USER
  useEffect(() => {
    if (!sessionId) return;

    async function load() {
      const [{ data: sessionData }, { data: userData }] =
        await Promise.all([
          supabase
            .from("game_sessions")
            .select(
              `
              *,
              p1:player1_id(full_name),
              p2:player2_id(full_name)
            `
            )
            .eq("id", sessionId)
            .single(),
          supabase.auth.getUser(),
        ]);

      if (sessionData) {
        setSession(sessionData);
        setCurrentPlayerId(sessionData.current_player_id);

        if (sessionData.status === "finished") {
          setMatchFinished(true);
          setShowMatchSummary(true);
        }
      }

      if (userData?.user) {
        const { data: player } = await supabase
          .from("players")
          .select("id")
          .eq("user_id", userData.user.id)
          .single();

        if (player) setCurrentUserPlayerId(player.id);
      }

      setLoading(false);
    }

    load();
  }, [sessionId, supabase]);
  // DEBUG: Check who is player1 and player2
useEffect(() => {
  if (!session || !currentUserPlayerId) return;

  console.log(
    "%c[DEBUG] Player identity check",
    "color: #00eaff; font-weight: bold;",
    {
      me: currentUserPlayerId,
      player1: session.player1_id,
      player2: session.player2_id,
      amIPlayer1: currentUserPlayerId === session.player1_id,
      amIPlayer2: currentUserPlayerId === session.player2_id,
    }
  );
}, [session, currentUserPlayerId]);


  // NEW: decide initiator (player 1)
  const isInitiator =
    session && currentUserPlayerId
      ? currentUserPlayerId === session.player1_id
      : false;

  // NEW: WebRTC hook
 const {
  remoteStream,
  connected,
  startCall,
  channelReady,
  peerReady,   // 👈 add this
} = useWebRTC({ sessionId, localStream, isInitiator });


  // ⭐ BIND REMOTE STREAM TO VIDEO
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("[GameRoom] Binding remote stream to video", remoteStream);
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ⭐ FIXED AUTO-START LOGIC
  useEffect(() => {
  if (!isInitiator) return;
  if (!localStream) return;
  if (!channelReady) return;
  if (!peerReady) return; // 👈 wait for the other peer

  if (!callStartedRef.current) {
    console.log("[GameRoom] Initiator starting call (peer ready + webcam ready)");
    callStartedRef.current = true;
    startCall();
  }
}, [isInitiator, localStream, channelReady, peerReady, startCall]);


  // 2) PRESENCE CHANNEL
  useEffect(() => {
    if (!sessionId || !currentUserPlayerId) return;

    const presenceChannel = supabase
      .channel(`presence-${sessionId}`, {
        config: {
          presence: {
            key: currentUserPlayerId.toString(),
          },
        },
      })
      .on("presence", { event: "sync" }, () => {
        console.log("Presence updated");
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            player_id: currentUserPlayerId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [sessionId, currentUserPlayerId, supabase]);

  // 3) LOAD SCORES
  async function loadScores() {
    const { data } = await supabase
      .from("game_scores")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (data) setScores(data);
  }

  useEffect(() => {
    if (!sessionId) return;
    loadScores();
  }, [sessionId]);

  // 4) REALTIME SCORE UPDATES
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel("game-scores-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_scores",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setScores((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase]);

  // 5) REALTIME SESSION UPDATES
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel("game-session-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${sessionId}`,
        },
        async () => {
          const { data: fullSession } = await supabase
            .from("game_sessions")
            .select(
              `
              *,
              p1:player1_id(full_name),
              p2:player2_id(full_name)
            `
            )
            .eq("id", sessionId)
            .single();

          if (!fullSession) return;

          if (
            session &&
            fullSession.current_leg !== session.current_leg &&
            !matchFinished
          ) {
            const winnerId = session.current_player_id;

            const winnerName =
              winnerId === fullSession.player1_id
                ? fullSession.p1?.full_name ?? "Player 1"
                : fullSession.p2?.full_name ?? "Player 2";

            setLegOverlay({
              winnerName,
              nextLeg: fullSession.current_leg,
            });
          }

          setSession(fullSession);
          setCurrentPlayerId(fullSession.current_player_id);

          if (fullSession.status === "finished") {
            setMatchFinished(true);
            setShowMatchSummary(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase, session, matchFinished]);

  // 8) STATS
  const stats = useMemo(() => {
    if (!session) return { p1: {}, p2: {} };

    const players = [session.player1_id, session.player2_id];

    const buildStats = (playerId) => {
      const playerScores = scores.filter((s) => s.player_id === playerId);

      if (playerScores.length === 0) {
        return {
          total: 0,
          darts: 0,
          perDart: 0,
          threeDartAvg: 0,
          first9Avg: 0,
          checkoutAttempts: 0,
          checkouts: 0,
          checkoutPct: 0,
        };
      }

      const total = playerScores.reduce((sum, s) => sum + s.score, 0);
      const visits = playerScores.length;
      const darts = visits * 3;

      const perDart = darts > 0 ? total / darts : 0;
      const threeDartAvg = perDart * 3;

      const first9 = playerScores.slice(0, 3);
      const first9Total = first9.reduce((sum, s) => sum + s.score, 0);
      const first9Darts = first9.length * 3;
      const first9Avg =
        first9Darts > 0 ? (first9Total / first9Darts) * 3 : 0;

      const checkoutAttempts = playerScores.filter(
        (s) => s.remaining <= 170 && s.remaining > 0
      ).length;

      const checkouts = playerScores.filter(
        (s) => s.remaining === 0
      ).length;

      const checkoutPct =
        checkoutAttempts > 0 ? (checkouts / checkoutAttempts) * 100 : 0;

      return {
        total,
        darts,
        perDart,
        threeDartAvg,
        first9Avg,
        checkoutAttempts,
        checkouts,
        checkoutPct,
      };
    };

    return {
      p1: buildStats(players[0]),
      p2: buildStats(players[1]),
    };
  }, [scores, session]);

  // 11) LEG HISTORY
  const historyRows = useMemo(() => {
    if (!session) return [];
    return scores.map((s) => ({
      id: s.id,
      playerName:
        s.player_id === session.player1_id
          ? session.p1?.full_name ?? "Player 1"
          : session.p2?.full_name ?? "Player 2",
      leg: s.leg,
      score: s.score,
      remaining: s.remaining,
    }));
  }, [scores, session]);

  // 6) LOADING STATE
  if (loading || !session) {
    return <div className="p-6">Loading game…</div>;
  }

  // 7) IS IT MY TURN?
  const isMyTurn =
    currentUserPlayerId === currentPlayerId && !matchFinished;

  // 9) REMAINING SCORES FOR CURRENT LEG
  const p1Last = scores
    .filter(
      (s) =>
        s.player_id === session.player1_id &&
        s.leg === session.current_leg
    )
    .slice(-1)[0];

  const p2Last = scores
    .filter(
      (s) =>
        s.player_id === session.player2_id &&
        s.leg === session.current_leg
    )
    .slice(-1)[0];

  const p1Remaining = p1Last ? p1Last.remaining : 501;
  const p2Remaining = p2Last ? p2Last.remaining : 501;

  const p1IsThrowing = currentPlayerId === session.player1_id;
  const p2IsThrowing = currentPlayerId === session.player2_id;

  const currentRemaining =
    currentPlayerId === session.player1_id ? p1Remaining : p2Remaining;

  const checkoutSuggestion = getCheckoutSuggestion(currentRemaining);

  // 10) MATCH WINNER (for summary modal)
  const winnerIdForSummary = (() => {
    const legWinnersByLeg = {};
    scores.forEach((s) => {
      if (s.remaining === 0) {
        legWinnersByLeg[s.leg] = s.player_id;
      }
    });

    const totalLegs = session.legs;
    const legsToWin = Math.floor(totalLegs / 2) + 1;

    const p1Legs = Object.values(legWinnersByLeg).filter(
      (id) => id === session.player1_id
    ).length;

    const p2Legs = Object.values(legWinnersByLeg).filter(
      (id) => id === session.player2_id
    ).length;

    if (p1Legs >= legsToWin) return session.player1_id;
    if (p2Legs >= legsToWin) return session.player2_id;
    return null;
  })();

  const winnerNameForSummary =
    winnerIdForSummary === session?.player1_id
      ? session.p1?.full_name
      : winnerIdForSummary === session?.player2_id
      ? session.p2?.full_name
      : null;

  // 12) SUBMIT SCORE
  async function submitScore() {
    const value = Number(input);
    if (!value && value !== 0) return;
    if (value < 0 || value > 180) return;
    if (!isMyTurn) return;
    if (!session) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!player) return;

    const playerScores = scores.filter(
      (s) =>
        s.player_id === player.id &&
        s.leg === session.current_leg
    );

    const lastRemaining = playerScores.length
      ? playerScores[playerScores.length - 1].remaining
      : 501;

    let newRemaining = lastRemaining - value;

    let isBust = false;
    if (newRemaining < 0 || newRemaining === 1) {
      isBust = true;
      newRemaining = lastRemaining;
    }

    await supabase.from("game_scores").insert({
      session_id: sessionId,
      player_id: player.id,
      leg: session.current_leg,
      score: value,
      remaining: newRemaining,
    });

    setInput("");

    if (newRemaining === 0) {
      const legWinnersByLeg = {};
      scores.forEach((s) => {
        if (s.remaining === 0) {
          legWinnersByLeg[s.leg] = s.player_id;
        }
      });

      const p1Legs = Object.values(legWinnersByLeg).filter(
        (id) => id === session.player1_id
      ).length;

      const p2Legs = Object.values(legWinnersByLeg).filter(
        (id) => id === session.player2_id
      ).length;

      const totalLegs = session.legs;
      const legsToWin = Math.floor(totalLegs / 2) + 1;

      const newP1Legs =
        p1Legs + (player.id === session.player1_id ? 1 : 0);
      const newP2Legs =
        p2Legs + (player.id === session.player2_id ? 1 : 0);

      const matchOver =
        newP1Legs >= legsToWin || newP2Legs >= legsToWin;

      if (matchOver) {
        await supabase
          .from("game_sessions")
          .update({ status: "finished" })
          .eq("id", sessionId);

        setMatchFinished(true);
        setShowMatchSummary(true);
        return;
      }

      const nextLeg = session.current_leg + 1;

      await supabase
        .from("game_sessions")
        .update({
          current_leg: nextLeg,
          current_player_id: player.id,
        })
        .eq("id", sessionId);

      return;
    }

    if (!isBust) {
      const { data: freshSession } = await supabase
        .from("game_sessions")
        .select("player1_id, player2_id, current_player_id")
        .eq("id", sessionId)
        .single();

      const nextPlayerId =
        freshSession.current_player_id ===
        freshSession.player1_id
          ? freshSession.player2_id
          : freshSession.player1_id;

      await supabase
        .from("game_sessions")
        .update({
          current_player_id: nextPlayerId,
        })
        .eq("id", sessionId);
    }
  }

  // 13) MAIN UI
  return (
    <div className="relative p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        {session.game_type} — Best of {session.legs}
      </h1>

      {/* NEW: VIDEO PANEL */}
<div className="flex gap-4 items-start">

        <div className="flex flex-col gap-1">
          <div className="text-xs text-slate-400">You</div>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-48 h-36 rounded-lg shadow-lg bg-black"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs text-slate-400">
            Opponent {connected ? "(connected)" : "(connecting...)"}
          </div>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            className="w-48 h-36 rounded-lg shadow-lg bg-black"
          />
        </div>
      </div>

      {/* PLAYER PANELS */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`rounded-lg border p-4 ${
            p1IsThrowing
              ? "border-green-500 shadow-lg"
              : "border-slate-700"
          } ${
            legWinPlayerId === session.player1_id
              ? "animate-pulse"
              : ""
          }`}
        >
          <div className="text-sm text-slate-400">Player 1</div>
          <div className="text-lg font-semibold">
            {session.p1?.full_name ?? "Player 1"}
          </div>

          <div className="text-4xl font-bold mt-2">
            {p1Remaining}
          </div>

          <div className="text-sm text-slate-400">
            {p1IsThrowing ? "Throwing" : ""}
          </div>

          <div className="mt-4 text-xs text-slate-400 space-y-1">
            <div>
              Per-dart avg:{" "}
              {stats.p1.perDart?.toFixed(2) ?? "0.00"}
            </div>
            <div>
              3-dart avg:{" "}
              {stats.p1.threeDartAvg?.toFixed(2) ?? "0.00"}
            </div>
            <div>
              First 9 avg:{" "}
              {stats.p1.first9Avg?.toFixed(2) ?? "0.00"}
            </div>
            <div>
              Checkout %:{" "}
              {stats.p1.checkoutPct?.toFixed(1) ?? "0.0"}% (
              {stats.p1.checkouts ?? 0}/
              {stats.p1.checkoutAttempts ?? 0})
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            p2IsThrowing
              ? "border-green-500 shadow-lg"
              : "border-slate-700"
          } ${
            legWinPlayerId === session.player2_id
              ? "animate-pulse"
              : ""
          }`}
        >
          <div className="text-sm text-slate-400">Player 2</div>
          <div className="text-lg font-semibold">
            {session.p2?.full_name ?? "Player 2"}
          </div>

          <div className="text-4xl font-bold mt-2">
            {p2Remaining}
          </div>

          <div className="text-sm text-slate-400">
            {p2IsThrowing ? "Throwing" : ""}
          </div>

          <div className="mt-4 text-xs text-slate-400 space-y-1">
            <div>
              Per-dart avg:{" "}
              {stats.p2.perDart?.toFixed(2) ?? "0.00"}
            </div>
            <div>
              3-dart avg:{" "}
              {stats.p2.threeDartAvg?.toFixed(2) ?? "0.00"}
            </div>
            <div>
              First 9 avg:{" "}
              {stats.p2.first9Avg?.toFixed(2) ?? "0.00"}
            </div>
            <div>
              Checkout %:{" "}
              {stats.p2.checkoutPct?.toFixed(1) ?? "0.0"}% (
              {stats.p2.checkouts ?? 0}/
              {stats.p2.checkoutAttempts ?? 0})
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT SUGGESTION */}
      {checkoutSuggestion && !matchFinished && (
        <div className="text-sm text-emerald-300">
          Checkout suggestion ({currentRemaining}):{" "}
          {checkoutSuggestion}
        </div>
      )}

      {/* SCORE ENTRY */}
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium">Enter Score</div>

        {matchFinished ? (
          <div className="text-sm text-emerald-400">
            Match finished — great shooting.
          </div>
        ) : !isMyTurn ? (
          <div className="text-sm text-slate-400">
            Waiting for the other player...
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={180}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isMyTurn || matchFinished}
            placeholder="Enter score (0–180)"
            className="w-40 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
          <button
            onClick={submitScore}
            disabled={!isMyTurn || matchFinished}
            className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            Submit
          </button>
        </div>

        {!isMyTurn && !matchFinished && (
          <div className="text-xs text-slate-500">
            Not your turn
          </div>
        )}
      </div>

      {/* LEG HISTORY */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-2">
          Leg History
        </h2>

        <div className="text-xs text-slate-400 grid grid-cols-4 gap-2 border-b border-slate-700 pb-1">
          <div>Player</div>
          <div>Leg</div>
          <div>Score</div>
          <div>Remaining</div>
        </div>

        <div className="text-xs mt-2 space-y-1">
          {historyRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-4 gap-2 border-b border-slate-800 pb-1"
            >
              <div>{row.playerName}</div>
              <div>{row.leg}</div>
              <div>{row.score}</div>
              <div>{row.remaining}</div>
            </div>
          ))}
        </div>
      </div>

      {/* LEG TRANSITION OVERLAY */}
      {legOverlay && !matchFinished && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="bg-slate-900 border border-emerald-500 rounded-lg px-6 py-4 text-center space-y-2 max-w-sm">
            <div className="text-sm text-emerald-300">
              Leg {session.current_leg - 1} complete
            </div>

            <div className="text-lg font-semibold">
              {legOverlay.winnerName} wins the leg
            </div>

            <div className="text-sm text-slate-300">
              Next up: Leg {legOverlay.nextLeg}. Winner throws first.
            </div>

            <button
              onClick={() => setLegOverlay(null)}
              className="mt-3 rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* MATCH SUMMARY MODAL */}
      {showMatchSummary && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="bg-slate-900 border border-emerald-500 rounded-lg px-6 py-5 text-sm max-w-lg w-full space-y-4">
            <div className="text-xs uppercase text-emerald-300 tracking-wide">
              Match summary
            </div>

            <div className="text-lg font-semibold">
              {winnerNameForSummary
                ? `${winnerNameForSummary} wins the match`
                : "Match finished"}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
              <div>
                <div className="font-semibold mb-1">
                  {session.p1?.full_name ?? "Player 1"}
                </div>
                <div>
                  Per-dart avg:{" "}
                  {stats.p1.perDart?.toFixed(2) ?? "0.00"}
                </div>
                <div>
                  3-dart avg:{" "}
                  {stats.p1.threeDartAvg?.toFixed(2) ?? "0.00"}
                </div>
                <div>
                  First 9 avg:{" "}
                  {stats.p1.first9Avg?.toFixed(2) ?? "0.00"}
                </div>
                <div>
                  Checkout %:{" "}
                  {stats.p1.checkoutPct?.toFixed(1) ?? "0.0"}% (
                  {stats.p1.checkouts ?? 0}/
                  {stats.p1.checkoutAttempts ?? 0})
                </div>
              </div>

              <div>
                <div className="font-semibold mb-1">
                  {session.p2?.full_name ?? "Player 2"}
                </div>
                <div>
                  Per-dart avg:{" "}
                  {stats.p2.perDart?.toFixed(2) ?? "0.00"}
                </div>
                <div>
                  3-dart avg:{" "}
                  {stats.p2.threeDartAvg?.toFixed(2) ?? "0.00"}
                </div>
                <div>
                  First 9 avg:{" "}
                  {stats.p2.first9Avg?.toFixed(2) ?? "0.00"}
                </div>
                <div>
                  Checkout %:{" "}
                  {stats.p2.checkoutPct?.toFixed(1) ?? "0.0"}% (
                  {stats.p2.checkouts ?? 0}/
                  {stats.p2.checkoutAttempts ?? 0})
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowMatchSummary(false)}
                className="rounded bg-slate-800 px-4 py-2 text-xs font-medium text-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
