
import React from 'react';

function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pt-20 pb-16">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">SMS Verification Made Simple</h1>
            <p className="text-xl mb-8 text-blue-100">Get temporary phone numbers for verification with 100+ services. Fast, reliable, and secure.</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <a href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center">
                <i className="fas fa-rocket mr-2"></i>Get Started Free
              </a>
              <a href="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition inline-flex items-center justify-center">
                <i className="fas fa-play mr-2"></i>Try Demo
              </a>
            </div>
            <div className="flex items-center text-blue-100">
              <i className="fas fa-check-circle mr-2"></i>
              <span>No credit card required • Instant setup</span>
            </div>
          </div>
          <div className="text-center">
            <i className="fas fa-mobile-alt text-9xl opacity-75"></i>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
