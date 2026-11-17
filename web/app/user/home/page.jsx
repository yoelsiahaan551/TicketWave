import UserHero from "@/app/components/user/UserHero";
import UpcomingConcert from "@/app/components/user/UpcomingConcert";
import PromoSection from "@/app/components/user/PromoSection";
import FavoriteArtist from "@/app/components/user/FavoriteArtist";


export default function UserHome() {
  return (
    <>
      <UserHero />
      <UpcomingConcert />
      <PromoSection />
      <FavoriteArtist />
    </>
  );
}