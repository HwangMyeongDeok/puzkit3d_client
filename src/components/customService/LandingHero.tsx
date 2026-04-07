'use client';

import Image from 'next/image';
import {
  ChevronRight,
  Lightbulb,
  PenTool,
  Printer,
  Truck,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingHeroProps {
  onStart: () => void;
}

const CASE_STUDIES = [
  {
    id: 1,
    title: 'Custom Mecha Robot',
    client: 'TechCorp Studio',
    image: '/images/hero/robot.png', // Sử dụng ảnh từ thư mục hiện có của bạn
  },
  {
    id: 2,
    title: 'Vintage Motorbike',
    client: 'Collector John D.',
    image: '/images/hero/motorbike.png',
  },
  {
    id: 3,
    title: 'Architecture Diorama',
    client: 'BuildIt Inc.',
    image: '/images/hero/house-brick.png',
  },
];

export default function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <div className="w-full overflow-hidden bg-white font-sans text-slate-900">
      {/* --- SECTION 1: HERO (NỀN MÀU ĐẬM) --- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 lg:px-8">
        {/* Background Gradients from HeroCarousel */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(96,165,250,0.20),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(125,211,252,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(56,189,248,0.12),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(2,23,68,0.98)_0%,rgba(3,42,99,0.95)_48%,rgba(9,54,131,0.92)_100%)]" />

        {/* White fade-out at the bottom transition to White Section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(3,42,99,0)_0%,rgba(244,248,255,1)_100%)]" />

        {/* -mt-20 lg:-mt-28 ĐỂ KÉO NỘI DUNG LÊN TRÊN CÂN BẰNG VỚI MÀN HÌNH LAPTOP */}
        <div className="container-custom animate-in fade-in slide-in-from-bottom-8 relative z-10 mx-auto -mt-20 max-w-5xl text-center duration-1000 lg:-mt-28">
          <div className="mb-8 flex justify-center">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white/80 uppercase backdrop-blur-md">
              <Star className="mr-2 h-4 w-4 text-sky-400" /> #1 Custom Design Service 2026
            </span>
          </div>

          <h1 className="text-5xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-7xl">
            Turn Your{' '}
            <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
              Brilliant Ideas
            </span>{' '}
            <br className="hidden sm:block" />
            Into Physical Reality
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
            From rough sketches to premium manufactured products. We provide end-to-end 3D modeling,
            prototyping, and assembly services for creators and businesses worldwide.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-4 sm:flex-row">
            <Button
              onClick={onStart}
              size="lg"
              className="group flex h-14 w-full items-center gap-2 rounded-full bg-white px-8 text-lg font-semibold text-[#032a63] shadow-[0_14px_35px_rgba(255,255,255,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 sm:w-auto"
            >
              Start Your Request
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: HOW IT WORKS (NỀN TRẮNG) --- */}
      <section className="bg-white px-6 py-24 sm:py-32">
        <div className="container-custom animate-in fade-in mx-auto max-w-7xl duration-1000">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mx-0 lg:text-left">
            <h2 className="text-sm font-bold tracking-[0.16em] text-[#032a63] uppercase">
              Process
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-blue-950 sm:text-5xl">
              How to bring your idea to life
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            {[
              {
                icon: Lightbulb,
                title: '1. Submit Idea',
                desc: 'Share your sketches, reference images, or descriptions. The more details, the better.',
              },
              {
                icon: PenTool,
                title: '2. 3D Design',
                desc: 'Our experts craft precise 3D models and send them to you for review and revisions.',
              },
              {
                icon: Printer,
                title: '3. Manufacture',
                desc: 'Once approved, we use premium materials and methods to build your custom product.',
              },
              {
                icon: Truck,
                title: '4. Delivery',
                desc: 'Your finished physical product is carefully packaged and shipped right to your door.',
              },
            ].map((step, idx) => (
              <div key={idx} className="group relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#032a63] transition-all group-hover:-translate-y-1 group-hover:bg-[#032a63] group-hover:text-white group-hover:shadow-[0_0_30px_rgba(3,42,99,0.3)]">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="leading-relaxed text-slate-600">{step.desc}</p>
                {/* Connector line (desktop only) */}
                {idx !== 3 && (
                  <div className="absolute top-8 right-0 left-20 -z-10 hidden h-[1px] bg-slate-100 lg:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: BENEFITS / FEATURES (NỀN MÀU ĐẬM) --- */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#021744]/50 px-6 py-24 backdrop-blur-sm sm:py-32">
        {/* White fade-in at the top transition from White Section */}
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(0deg,rgba(3,42,99,0)_0%,rgba(244,248,255,1)_100%)]" />

        {/* Reusing Background Gradients from Section 1 for consistent depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(96,165,250,0.15),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(125,211,252,0.10),transparent_24%)]" />

        <div className="container-custom animate-in fade-in relative z-10 mx-auto max-w-7xl duration-1000">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Why creators choose our manufacturing platform
              </h2>
              <p className="mt-4 text-lg text-white/72">
                We bridge the gap between imagination and reality with industry-leading quality,
                transparent pricing, and rapid turnaround times.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  {
                    icon: Zap,
                    title: 'Rapid Prototyping',
                    desc: 'Get your first prototype in as little as 72 hours.',
                  },
                  {
                    icon: Shield,
                    title: 'Premium Quality',
                    desc: 'Industrial-grade materials ensuring durability and precision.',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Unlimited Revisions',
                    desc: 'We tweak the 3D model until it exactly matches your vision.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                      <item.icon className="h-5 w-5 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{item.title}</h4>
                      <p className="mt-1 text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Glassmorphic Image Feature - Reusing pattern from HeroCarousel */}
            <div className="relative flex h-full min-h-[400px] items-center justify-center overflow-hidden rounded-[36px] border border-white/15 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-sm sm:p-12">
              <div className="absolute bottom-12 left-1/2 h-24 w-[72%] -translate-x-1/2 rounded-full bg-black/30 blur-3xl" />
              <div className="relative z-10 w-full max-w-sm text-center">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                  <Image
                    src="/images/hero/robot.png"
                    alt="Premium 3D Model Example"
                    fill
                    className="object-contain p-4 drop-shadow-[0_28px_50px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: SUCCESSFUL CASE STUDIES (NEW - NỀN TRẮNG) --- */}
      <section className="border-b border-slate-100 bg-white px-6 py-24 sm:py-32">
        <div className="container-custom animate-in fade-in mx-auto max-w-7xl duration-1000">
          <div className="mb-16 flex flex-col items-center text-center">
            <Trophy className="mb-4 h-10 w-10 text-[#032a63]" />
            <h2 className="text-3xl font-extrabold text-blue-950 sm:text-5xl">Success Stories</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Take a look at some of the custom requests we've transformed from simple concepts into
              stunning physical realities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {CASE_STUDIES.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-100"
              >
                <div className="relative mb-6 h-64 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  <div className="absolute bottom-0 left-1/2 h-16 w-[60%] -translate-x-1/2 rounded-full bg-blue-400/10 blur-2xl transition-all group-hover:bg-blue-400/20" />
                  {/* Đảm bảo bạn có các ảnh này trong folder public/images/hero/ */}
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm font-medium tracking-wide text-[#032a63] uppercase">
                    For: {item.client}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 5: BOTTOM CTA (NỀN MÀU ĐẬM) --- */}
      <section className="relative overflow-hidden bg-[#032a63] px-6 py-24 text-center sm:py-32">
        {/* Background Radial for glowing effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.15),transparent_60%)]" />

        <div className="container-custom animate-in fade-in relative z-10 mx-auto max-w-3xl duration-1000">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Ready to build something amazing?
          </h2>
          <p className="mt-6 text-xl text-white/72">
            Join thousands of creators who have already brought their custom designs to life. Let's
            start with your idea today.
          </p>
          <div className="mt-10">
            <Button
              onClick={onStart}
              size="lg"
              className="h-16 rounded-full bg-white px-10 text-xl font-bold text-[#032a63] shadow-[0_14px_35px_rgba(255,255,255,0.2)] transition-all hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_20px_40px_rgba(255,255,255,0.25)]"
            >
              Start Your Request Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
