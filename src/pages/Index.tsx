import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Services from "@/components/landing/Services";
import Plans from "@/components/landing/Plans";
import Testimonials from "@/components/landing/Testimonials";
import Stats from "@/components/landing/Stats";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Services />
      <Plans />
      <Testimonials />
      <Stats />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
