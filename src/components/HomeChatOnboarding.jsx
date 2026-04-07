import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const qaPairs = [
  {
    question: "How do I get started?",
    answer: "Go to our Services page, click “Join Now”, and onboard as a patient.",
  },
  {
    question: "Where do I get my products?",
    answer: "Once you’re an Original Source SAHPRA-registered patient, you can order directly on our website.",
  },
  {
    question: "Can I choose what I get?",
    answer: "After your consultation, the doctor will provide a detailed prescription tailored to your needs.",
  },
  {
    question: "Is it legally approved?",
    answer: "Yes — doctor-guided care within South African regulations, with follow-up support.",
  },
];

const HomeChatOnboarding = () => {
  const [chatStep, setChatStep] = useState("question");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleQA, setVisibleQA] = useState({ question: "", answer: "" });

  useEffect(() => {
    const index = currentIndex % qaPairs.length;
    const { question, answer } = qaPairs[index];

    setVisibleQA({ question, answer });
    setChatStep("question");

    const typingTimer = setTimeout(() => setChatStep("typing"), 1000);
    const answerTimer = setTimeout(() => setChatStep("answer"), 2500);
    const nextStepTimer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setChatStep("question");
    }, 5500);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(answerTimer);
      clearTimeout(nextStepTimer);
    };
  }, [currentIndex]);

  return (
<section className="relative py-20 px-6 md:px-12 bg-gradient-to-br from-[#0A4040] via-[#08B2B2] to-[#0A4040] text-white">
      <div className="max-w-xl mx-auto space-y-8">
        <h2 className="text-3xl font-medium mb-4 font-balooChettan text-center">
          HOW TO GET YOUR MEDICAL CANNABIS
        </h2>
        <p className="text-lg text-center font-light mb-10">
          Let’s walk you through how it works.
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg space-y-4 min-h-[200px]">
          {visibleQA.question && (
            <div className="flex justify-end">
              <div className="bg-white/20 text-white px-4 py-3 rounded-2xl rounded-bl-none max-w-xs md:max-w-md text-sm shadow">
                {visibleQA.question}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {chatStep === "typing" && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-[#F3EDE2] text-black px-4 py-3 rounded-2xl rounded-br-none max-w-xs md:max-w-md text-sm shadow">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </motion.div>
            )}

            {chatStep === "answer" && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="bg-[#F3EDE2] text-black px-4 py-3 rounded-2xl rounded-br-none max-w-xs md:max-w-md text-sm shadow">
                  {visibleQA.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HomeChatOnboarding;
