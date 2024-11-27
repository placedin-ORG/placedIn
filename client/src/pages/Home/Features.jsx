import React from "react";
import SmallUnderline from "../../component/SmallUnderline";

const Features = () => {
  const features = [
    {
      icon: "📚",
      title: "Comprehensive Courses",
      description:
        "Access a vast library of courses across competitive exams, skill-building, and more.",
      details:
        "Expert-curated syllabus, video lectures, and downloadable resources.",
    },
    {
      icon: "🖥️",
      title: "Real-Time Mock Exams",
      description: "Experience exam-like conditions with real-time mock tests.",
      details:
        "AI-proctored tests, detailed solutions, and nationwide rankings.",
    },
    {
      icon: "📊",
      title: "Personalized Analytics",
      description: "Track your progress with in-depth performance insights.",
      details:
        "Topic-wise analysis, improvement suggestions, and time management insights.",
    },
    {
      icon: "💰",
      title: "Affordable Subscription Plans",
      description:
        "Learn without breaking the bank with our flexible subscription options.",
      details:
        "No hidden fees, monthly and yearly plans, and free trial available.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-3 lg:px-8">
        <div className="text-center mb-12 relative">
          <h2 className="text-4xl font-bold text-primary">Our Key Features</h2>
          <p className="mt-2 text-lg text-gray-600">
            Discover how we make learning effective and engaging.
          </p>
          <SmallUnderline className={"w-10 -bottom-2 bg-primary-dark"} />
        </div>

        <div className="grid grid-cols-1 place-items-center md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative grainy-light group transform w-full lg:max-w-64 h-full rounded-xl border border-gray-300 transition-shadow duration-300 ease-in-out shadow-sm hover:shadow-neumorphic"
              data-aos="fade-up"
            >
              {/* Front Side */}
              <div className="relative p-6 rounded-lg  text-center">
                <div className="text-6xl mb-4 text-orange-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
