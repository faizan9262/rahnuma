import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Sparkles, Zap } from "lucide-react";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/authStore";
import { lazy, Suspense } from "react";

const HeroRightLoop = lazy(() => import("../components/HeroLoop"));

export default function Hero() {
  const { user } = useAuthStore();

  return (
    <>
      <section className="relative w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-28 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight font-display mb-6 drop-shadow-lg text-foreground">
              Study Smarter <br />
              <span className="text-primary inline-block">Rehnuma</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-xl text-foreground">
              Your AI-powered study partner: upload notes, ask questions, and
              practice quizzes. Learn faster and retain knowledge longer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button className="bg-primary text-background" asChild>
                <a href="/signup">Get Started Free</a>
              </Button>
              <Button
                className="border border-primary text-primary bg-transparent"
                asChild
              >
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
          <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
            <HeroRightLoop />
          </Suspense>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-12 max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
          Core Features
        </h2>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              title: "Exploration Mode",
              desc: "Ask natural questions and get precise answers from your notes.",
            },
            {
              icon: Zap,
              title: "Challenge Mode",
              desc: "Turn notes into quizzes to actively test and reinforce knowledge.",
            },
            {
              icon: Shield,
              title: "Secure AI",
              desc: "All processing is local with open-source AI — your data stays private.",
            },
            {
              icon: Sparkles,
              title: "Flexible Plans",
              desc: "Start free or upgrade to Pro for unlimited uploads & features.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 bg-primary text-white rounded-xl hover:-translate-y-1 hover:shadow-lg transition transform"
            >
              <f.icon className="w-10 h-10 mb-4 " />
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-foreground/80">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16 text-foreground">
            How Rehnuma Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Upload Notes",
                desc: "Add PDFs or documents. Content stays private and secure.",
              },
              {
                step: "2",
                title: "Ask or Quiz",
                desc: "Ask questions or let Rehnuma create quizzes tailored to your notes.",
              },
              {
                step: "3",
                title: "Learn Smarter",
                desc: "Get instant answers, feedback, and references to master material.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-8 bg-background shadow-card hover:shadow-lg transition rounded-xl"
              >
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-primary text-background font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  {item.title}
                </h3>
                <p className="text-foreground/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
          Choose Your Plan
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="p-10 bg-background border-2 border-primary shadow-lg hover:shadow-2xl transition rounded-xl">
            <h3 className="text-2xl font-semibold mb-4 text-primary">
              Rehnuma Basic
            </h3>
            <p className="mb-4 text-foreground/80">
              Upload up to 3 documents and enjoy limited quizzes monthly.
            </p>
            <p className="font-bold mb-6 text-foreground">Free</p>
            <Button className="bg-primary text-background" asChild>
              <a href="/signup">Start Free</a>
            </Button>
          </div>

          <div className="p-10 bg-primary rounded-xl shadow-lg hover:shadow-xl transition relative overflow-hidden">
            <span className="absolute top-4 right-4 bg-secondary text-xs px-3 py-1 rounded-full">
              Most Popular
            </span>
            <h3 className="text-2xl font-semibold mb-4 text-background">
              Rehnuma Pro
            </h3>
            <p className="mb-4 text-background/80">
              Unlimited uploads, quizzes, and advanced features like folders &
              analytics.
            </p>
            <p className="font-bold mb-6 text-background">$5 / month</p>
            <Button
              variant="outline"
              className="bg-background text-primary hover:bg-background/90"
              asChild
            >
              <a href="/signup">Go Pro</a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
        <h2 className="text-4xl font-bold mb-6 text-foreground">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-lg mb-10 max-w-2xl mx-auto text-foreground/80">
          Rehnuma is built for students everywhere — from high school to PhD.
          Make learning active, personal, and effective.
        </p>
        <Button className="bg-primary text-background" size="lg" asChild>
          <a href="/signup">Sign Up Now</a>
        </Button>
      </section>
      <Footer />
    </>
  );
}
