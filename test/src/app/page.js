import Navbar from '@/components/Navbar'
import HeroCarousel from '@/components/HeroCarousel'
import Hero from '@/components/Hero'
import StatsBar from '@/components/StatsBar'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Diseases from '@/components/Diseases'
import Blockchain from '@/components/Blockchain'
import Hospitals from '@/components/Hospitals'
import CallToAction from '@/components/CallToAction'
import Footer from '@/components/Footer'
import NeuralCanvas from '@/components/NeuralCanvas'

export default function Home() {
  return (
    <>
      <NeuralCanvas />
      <div className="home-page">
        <Navbar />
        <main>
          <HeroCarousel />
          <Hero />
          <StatsBar />
          <Features />
          <HowItWorks />
          <Diseases />
          <Blockchain />
          <Hospitals />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </>
  )
}
