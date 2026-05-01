"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

import PlayerCard from "@/components/profile/PlayerCard";
import ProfileSection from "@/components/profile/ProfileSection";

export default function ProfilePage() {
  const supabase = createClientBrowser();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("PROFILE LOADED:", data, error);

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        No profile found.
      </div>
    );
  }

  const render = (value) =>
    Array.isArray(value) ? value.join(", ") || "—" : value || "—";

  return (
    <div className="min-h-screen bg-180 text-white p-6">
      <div className="w-full flex flex-col gap-8">

        {/* HERO CARD */}
        <div className="w-full md:w-1/2">
          <PlayerCard profile={profile} user={user} />
        </div>

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Identity */}
          <ProfileSection title="Player Identity">
            <ul className="space-y-2">
              <li><strong>Nickname:</strong> {render(profile.nickname)}</li>
              <li><strong>Favourite Player:</strong> {render(profile.favourite_player)}</li>
              <li><strong>Walk-On Song:</strong> {render(profile.walk_on_song)}</li>
            </ul>
          </ProfileSection>

          {/* Playing Style */}
          <ProfileSection title="Playing Style">
            <ul className="space-y-2">
              <li><strong>Throwing Style:</strong> {render(profile.throwing_style)}</li>
              <li><strong>Throwing Stance:</strong> {render(profile.stance)}</li>
              <li><strong>Dominant Eye:</strong> {render(profile.dominant_eye)}</li>
              <li><strong>Grip Style:</strong> {render(profile.grip_style)}</li>
              
            </ul>
          </ProfileSection>

          {/* Darts Setup */}
          <ProfileSection title="Darts Setup">
            <ul className="space-y-2">
              <li><strong>Dart Brand:</strong> {render(profile.dart_brand)}</li>
              <li><strong>Dart Weight:</strong> {render(profile.dart_weight)}</li>
              <li><strong>Barrel Shape:</strong> {render(profile.barrel_shape)}</li>
              
              <li><strong>Flight Shape:</strong> {render(profile.flight_shape)}</li>
            </ul>
          </ProfileSection>

          {/* Goals */}
          <ProfileSection title="Training & Mindset">
            <ul className="space-y-2">
              <li><strong>Practice Frequency:</strong> {render(profile.practice_frequency)}</li>
              <li><strong>Competition Mindset:</strong> {render(profile.competition_mindset)}</li>
              <li><strong>Confidence Level:</strong> {render(profile.confidence_level)}</li>
              <li><strong>Strengths:</strong> {render(profile.strengths)}</li>
              <li><strong>Areas to improve:</strong> {render(profile.improvements)}</li>
            </ul>
          </ProfileSection>

        </div>

        {/* EDIT BUTTON */}
        <button
          onClick={() => (window.location.href = "/dashboard/profile/edit")}
          className="cursor-pointer w-full bg-brand text-black py-3 rounded-lg font-semibold shadow-lg shadow-black/40"
        >
          Edit Profile
        </button>

      </div>
    </div>
  );
}
