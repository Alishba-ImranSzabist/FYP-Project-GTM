import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import PlatformSection from "../components/PlatformSection";
import SolutionsSection from "../components/SolutionsSection";
import HowItWorksSection from "../components/HowItWorksSection";
import WhySection from "../components/WhySection";
import FinalCta from "../components/FinalCta";
import SiteFooter from "../components/SiteFooter";
import "../Home.css";

export default function HomePage() {
  return (
    <div className="page home">
      <Navbar />
      <main>
        <HeroSection />
        <PlatformSection />
        <SolutionsSection />
        <HowItWorksSection />
        <WhySection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
