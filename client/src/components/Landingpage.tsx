import React from "react";
import { auth, googleProvider } from '../../utils/firebase';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';

export default function LandingPage() {
    const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

    const handleSignIn = async () => {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };
  
    if (error) {
      return (
        <div className="text-red-600 p-4 text-center">
          Error: {error.message}
        </div>
      );
    }
  
    if (loading) {
      return <div className="text-center p-4">Loading...</div>;
    }
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-800">DigiFlow AI</div>
        <div className="space-x-8 hidden md:flex">
          <a href="#capabilities" className="hover:text-blue-600 transition-all duration-300">Capabilities</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition-all duration-300">How It Works</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-all duration-300">Testimonials</a>
        </div>
        <button onClick={handleSignIn} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:scale-105 transition-transform shadow-lg">
          Try It Free
        </button>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-10 md:mb-0 md:pr-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
            Conquer Digital Overload with AI Automation
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Your intelligent assistant that handles web tasks, manages bookings, and optimizes workflows - 
            autonomously and securely.
          </p>
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg hover:scale-105 transition-transform shadow-lg">
              Start Free Trial
            </button>
            <button className="border-2 border-blue-600 text-blue-800 px-8 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 mt-12 md:mt-0">
          <img 
            src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
            alt="AI Assistant Interface"
            className="w-full h-auto rounded-2xl shadow-2xl border-8 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500"
          />
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-blue-800">AI-Powered Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl mb-6 flex items-center justify-center">
                <img src="https://cdn-icons-png.flaticon.com/512/1995/1995485.png" className="w-10 h-10" alt="Autopilot" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Autopilot Mode</h3>
              <p className="text-gray-600">Automates complex workflows across multiple platforms, handling form submissions, bookings, and purchases 24/7.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl mb-6 flex items-center justify-center">
                <img src="https://cdn-icons-png.flaticon.com/512/2491/2491935.png" className="w-10 h-10" alt="Smart Learning" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Smart Learning</h3>
              <p className="text-gray-600">Adapts to your preferences and decision-making patterns for increasingly personalized task handling.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl mb-6 flex items-center justify-center">
                <img src="https://cdn-icons-png.flaticon.com/512/2117/2117639.png" className="w-10 h-10" alt="Integration" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Universal Integration</h3>
              <p className="text-gray-600">Connects with 5000+ services and websites through our secure API ecosystem.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-20 bg-gradient-to-br from-blue-800 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Simple Implementation</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-6 text-blue-200">1</div>
              <h3 className="text-2xl font-semibold mb-4">Define Preferences</h3>
              <p className="text-blue-100">Teach the AI your priorities through simple natural language or examples</p>
            </div>
            <div className="p-8 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-6 text-blue-200">2</div>
              <h3 className="text-2xl font-semibold mb-4">Set Parameters</h3>
              <p className="text-blue-100">Establish boundaries and approval requirements for different task types</p>
            </div>
            <div className="p-8 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-6 text-blue-200">3</div>
              <h3 className="text-2xl font-semibold mb-4">Let AI Work</h3>
              <p className="text-blue-100">Monitor or fully automate - our assistant handles the rest securely</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-blue-800">Trusted by Innovators</h2>
          <div className="grid gap-12 md:grid-cols-2">
            <div className="p-8 bg-blue-50 rounded-2xl">
              <p className="text-xl mb-6">"DigiFlow AI saved us 20+ hours weekly on vendor management. It's like having an extra team member that never sleeps."</p>
              <div className="flex items-center">
                <img src="https://randomuser.me/api/portraits/men/75.jpg" className="w-12 h-12 rounded-full mr-4" alt="User" />
                <div>
                  <div className="font-semibold">Mark Johnson</div>
                  <div className="text-sm text-gray-500">CTO, TechForward Inc.</div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-blue-50 rounded-2xl">
              <p className="text-xl mb-6">"The smart learning capability transformed how we handle customer onboarding. Error rates dropped by 90%."</p>
              <div className="flex items-center">
                <img src="https://randomuser.me/api/portraits/women/45.jpg" className="w-12 h-12 rounded-full mr-4" alt="User" />
                <div>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-gray-500">COO, Global Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">DigiFlow AI</div>
              <p className="text-blue-200">Empowering digital efficiency through intelligent automation</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-blue-300">Features</a></li>
                <li><a href="#security" className="hover:text-blue-300">Security</a></li>
                <li><a href="#pricing" className="hover:text-blue-300">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="hover:text-blue-300">About</a></li>
                <li><a href="#blog" className="hover:text-blue-300">Blog</a></li>
                <li><a href="#careers" className="hover:text-blue-300">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#privacy" className="hover:text-blue-300">Privacy</a></li>
                <li><a href="#terms" className="hover:text-blue-300">Terms</a></li>
                <li><a href="#contact" className="hover:text-blue-300">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-12 pt-8 text-center text-blue-300">
            © {new Date().getFullYear()} DigiFlow AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}