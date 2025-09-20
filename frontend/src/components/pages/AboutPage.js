import React from 'react';
import { Typography, Card, Button } from '../atoms';
import BaseLayout from '../templates/BaseLayout';

const AboutPage = () => {
  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Co-Founder", 
      bio: "Former VP Engineering at Twilio. 15+ years building communication platforms. Stanford CS, Y Combinator alum.",
      avatar: "AJ",
      linkedin: "#"
    },
    {
      name: "Maria Garcia",
      role: "CTO & Co-Founder",
      bio: "Ex-Google Senior Staff Engineer. Led WhatsApp Business API team. MIT PhD in Distributed Systems.",
      avatar: "MG", 
      linkedin: "#"
    },
    {
      name: "David Chen",
      role: "Head of Product",
      bio: "Former Product Lead at Stripe. Built developer tools used by 100K+ developers. Harvard MBA.",
      avatar: "DC",
      linkedin: "#"
    },
    {
      name: "Sarah Kim",
      role: "Head of Security",
      bio: "Ex-Microsoft Security Architect. CISSP certified. Led SOC2 compliance for 3 unicorn startups.",
      avatar: "SK",
      linkedin: "#"
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description: "Started with a vision to simplify communication infrastructure for developers"
    },
    {
      year: "2023",
      title: "First 100 Customers", 
      description: "Reached product-market fit with SMS verification platform"
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Launched AI-powered conversation assistance and automation features"
    },
    {
      year: "2024",
      title: "Enterprise Ready",
      description: "Achieved SOC2 compliance and launched multi-tenant architecture"
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded to 15+ countries with 99.9% uptime SLA"
    }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Developer First",
      description: "We build tools that developers love to use. Clean APIs, excellent docs, and intuitive interfaces."
    },
    {
      icon: "🛡️", 
      title: "Security by Design",
      description: "Security isn't an afterthought. We build with privacy and compliance at the core."
    },
    {
      icon: "🚀",
      title: "Innovation",
      description: "We push the boundaries of what's possible in communication technology."
    },
    {
      icon: "🤝",
      title: "Customer Success",
      description: "Your success is our success. We're partners in your growth journey."
    },
    {
      icon: "🌍",
      title: "Global Impact",
      description: "Building communication infrastructure that connects the world."
    },
    {
      icon: "💡",
      title: "Transparency",
      description: "Open source, transparent pricing, and honest communication always."
    }
  ];

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Typography variant="h1" className="text-5xl font-bold mb-6 text-white">
                Building the Future of Communication
              </Typography>
              <Typography variant="body" className="text-xl text-blue-100 mb-8">
                We're on a mission to make reliable, intelligent communication infrastructure 
                accessible to every developer and business worldwide.
              </Typography>
              <div className="flex items-center justify-center space-x-8 text-blue-100">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm">Developers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">15+</div>
                  <div className="text-sm">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Typography variant="h2" className="text-3xl font-bold mb-6">
                  Our Mission
                </Typography>
                <Typography className="text-xl text-gray-600 leading-relaxed">
                  To democratize communication infrastructure by providing developers and businesses 
                  with powerful, reliable, and intelligent tools that scale from startup to enterprise. 
                  We believe every company should have access to world-class communication capabilities 
                  without the complexity and cost of building from scratch.
                </Typography>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl mb-4">🎯</div>
                  <Typography variant="h3" className="text-xl font-semibold mb-3">
                    Simplicity
                  </Typography>
                  <Typography className="text-gray-600">
                    Complex communication infrastructure made simple through intuitive APIs and excellent documentation.
                  </Typography>
                </div>
                <div>
                  <div className="text-4xl mb-4">⚡</div>
                  <Typography variant="h3" className="text-xl font-semibold mb-3">
                    Performance
                  </Typography>
                  <Typography className="text-gray-600">
                    Lightning-fast delivery with 99.9% uptime and &lt;100ms response times globally.
                  </Typography>
                </div>
                <div>
                  <div className="text-4xl mb-4">🔒</div>
                  <Typography variant="h3" className="text-xl font-semibold mb-3">
                    Trust
                  </Typography>
                  <Typography className="text-gray-600">
                    Enterprise-grade security, compliance, and reliability you can depend on.
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Typography variant="h2" className="text-3xl font-bold mb-4">
                Our Values
              </Typography>
              <Typography className="text-xl text-gray-600">
                The principles that guide everything we do
              </Typography>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <Typography variant="h3" className="text-xl font-semibold mb-3">
                    {value.title}
                  </Typography>
                  <Typography className="text-gray-600">
                    {value.description}
                  </Typography>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Typography variant="h2" className="text-3xl font-bold mb-4">
                Meet Our Team
              </Typography>
              <Typography className="text-xl text-gray-600">
                Experienced leaders from top tech companies
              </Typography>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {member.avatar}
                  </div>
                  <Typography variant="h3" className="text-xl font-semibold mb-2">
                    {member.name}
                  </Typography>
                  <Typography className="text-blue-600 font-medium mb-3">
                    {member.role}
                  </Typography>
                  <Typography className="text-gray-600 text-sm mb-4">
                    {member.bio}
                  </Typography>
                  <Button variant="outline" size="sm" className="text-blue-600">
                    LinkedIn
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Typography variant="h2" className="text-3xl font-bold mb-4">
                Our Journey
              </Typography>
              <Typography className="text-xl text-gray-600">
                Key milestones in building the future of communication
              </Typography>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mx-auto mb-2">
                        {milestone.year}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="w-px h-16 bg-gray-300 mx-auto"></div>
                      )}
                    </div>
                    <div className="flex-1 ml-6">
                      <Typography variant="h3" className="text-xl font-semibold mb-2">
                        {milestone.title}
                      </Typography>
                      <Typography className="text-gray-600">
                        {milestone.description}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <Typography variant="h2" className="text-3xl font-bold mb-4 text-white">
              Join Our Mission
            </Typography>
            <Typography className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              We're always looking for talented individuals who share our passion for 
              building exceptional communication infrastructure.
            </Typography>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100">
                🚀 View Open Positions
              </Button>
              <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
                📧 Contact Us
              </Button>
            </div>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
};

export default AboutPage;