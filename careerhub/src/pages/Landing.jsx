import { Link } from "react-router-dom";

const features = [
  { icon: "⊞", title: "Developer Profiles", desc: "Showcase your skills, projects, GitHub, LeetCode, and more in one place." },
  { icon: "◈", title: "Smart Feed", desc: "Follow peers, share insights, and build your reputation in the dev community." },
  { icon: "✦", title: "AI Resume Tools", desc: "Generate a professional resume summary and improve posts with Gemini AI." },
];

export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <div className="relative py-24 text-center">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-accent/10 via-ch-violet/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-20 left-[10%] w-[300px] h-[300px] bg-ch-pink/6 rounded-full blur-3xl" />
          <div className="absolute top-10 right-[10%] w-[250px] h-[250px] bg-ch-teal/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-pale border border-accent/20 text-accent text-xs font-semibold tracking-wide uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            For Developers, by Developers
          </span>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.08] text-ink tracking-tight mb-6">
            Your professional network,
            <br />
            <span className="gradient-text">built for builders</span>
          </h1>
          <p className="text-lg text-ink-2 max-w-lg mx-auto mb-10 leading-relaxed">
            Connect with engineers, share your work, get AI-powered career tools, and grow your developer network.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-full gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-glow"
            >
              Get started — it's free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-full border border-paper-3 text-ink-2 text-sm font-semibold hover:border-accent/40 hover:text-accent hover:bg-accent-pale transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto mt-20 px-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-paper-3 shadow-sm p-6 text-left card-hover"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-11 h-11 rounded-xl gradient-bg text-white text-lg flex items-center justify-center mb-4 shadow-sm">
                {f.icon}
              </div>
              <div className="font-display font-semibold text-sm mb-2 text-ink">{f.title}</div>
              <div className="text-xs text-ink-3 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
