import React, { useState } from 'react';
import { Typography, Card, Button, Badge } from '../atoms';
import { SearchBar } from '../molecules';
import BaseLayout from '../templates/BaseLayout';

const ReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  const reviews = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "CTO",
      company: "TechFlow Solutions",
      rating: 5,
      date: "2024-11-15",
      title: "Game-changer for our verification workflow",
      text: "CumApp reduced our SMS verification costs by 40% while improving delivery rates. The AI-powered features are incredible - it automatically handles customer queries and escalates complex issues. Setup took less than an hour. The documentation is excellent and support team is very responsive.",
      avatar: "SC",
      verified: true,
      helpful: 24
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Lead Developer", 
      company: "StartupHub",
      rating: 5,
      date: "2024-11-10",
      title: "Best communication platform we've used",
      text: "We migrated from Twilio + custom chat solution to CumApp. The unified platform saved us 6 months of development time. Real-time features work flawlessly, and the React components are beautiful. The API is intuitive and well-documented.",
      avatar: "MR",
      verified: true,
      helpful: 18
    },
    {
      id: 3,
      name: "Jennifer Park",
      role: "Product Manager",
      company: "GrowthCorp", 
      rating: 5,
      date: "2024-11-08",
      title: "Excellent support and documentation",
      text: "Implementation was smooth thanks to comprehensive docs. When we had questions, support responded within hours. The platform scales effortlessly - we went from 1K to 100K users without issues. Analytics dashboard provides great insights.",
      avatar: "JP",
      verified: true,
      helpful: 31
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Security Lead",
      company: "EnterpriseMax",
      rating: 5,
      date: "2024-11-05",
      title: "Perfect for enterprise compliance",
      text: "Security features are top-notch. GDPR compliance, audit trails, and role-based access made our compliance team happy. The multi-tenant architecture works perfectly for our B2B SaaS. SOC2 compliance was a huge plus.",
      avatar: "DT",
      verified: true,
      helpful: 27
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Operations Director",
      company: "ScaleUp Inc",
      rating: 5,
      date: "2024-11-02",
      title: "Cost-effective and reliable",
      text: "Switched from expensive enterprise solutions. CumApp delivers the same features at 60% lower cost. 99.9% uptime in 8 months of usage. The AI suggestions actually help our support team respond faster and more accurately.",
      avatar: "LW",
      verified: true,
      helpful: 22
    },
    {
      id: 6,
      name: "Ahmed Hassan",
      role: "Founder",
      company: "MobileFirst",
      rating: 5,
      date: "2024-10-28",
      title: "Incredible developer experience",
      text: "As a startup, we needed something that 'just works'. CumApp delivered exactly that. The free tier was generous enough for our MVP, and scaling up was seamless. The webhook system is reliable and the error handling is excellent.",
      avatar: "AH",
      verified: true,
      helpful: 19
    },
    {
      id: 7,
      name: "Emily Rodriguez",
      role: "Engineering Manager",
      company: "DataCorp",
      rating: 4,
      date: "2024-10-25",
      title: "Great platform with minor room for improvement",
      text: "Overall excellent experience. The platform is robust and feature-rich. Only minor issue was initial setup complexity for our specific use case, but support helped us through it. Would definitely recommend for enterprise use.",
      avatar: "ER",
      verified: true,
      helpful: 15
    },
    {
      id: 8,
      name: "Michael Chang",
      role: "CTO",
      company: "FinTech Solutions",
      rating: 5,
      date: "2024-10-20",
      title: "Excellent for financial services compliance",
      text: "Working in fintech, compliance is critical. CumApp's security features, audit logs, and compliance certifications made our regulatory approval process smooth. The platform handles high-volume transactions without issues.",
      avatar: "MC",
      verified: true,
      helpful: 33
    }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;
    
    return matchesSearch && matchesRating;
  });

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-white py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center mb-4">
                <img src="/trustpilot-logo.svg" alt="Trustpilot" className="h-8 mr-4" />
                <Typography variant="h1" className="text-3xl font-bold">
                  Customer Reviews
                </Typography>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <span className="text-yellow-400 text-3xl mr-3">⭐⭐⭐⭐⭐</span>
                <div>
                  <Typography variant="h2" className="text-2xl font-bold">
                    {averageRating.toFixed(1)}/5
                  </Typography>
                  <Typography className="text-gray-600">
                    Based on {reviews.length} reviews
                  </Typography>
                </div>
              </div>

              <Typography className="text-xl text-gray-600 mb-8">
                See what our customers say about CumApp's communication platform
              </Typography>

              {/* Rating Distribution */}
              <div className="max-w-md mx-auto mb-8">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center mb-2">
                    <span className="w-12 text-sm">{rating} star</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${(ratingDistribution[rating] / reviews.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-sm text-gray-600">
                      {ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search reviews by company, name, or content..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Typography className="text-sm text-gray-600">Filter by rating:</Typography>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All ratings</option>
                    <option value="5">5 stars</option>
                    <option value="4">4 stars</option>
                    <option value="3">3 stars</option>
                    <option value="2">2 stars</option>
                    <option value="1">1 star</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                          {review.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Typography variant="h4" className="font-semibold">
                              {review.name}
                            </Typography>
                            {review.verified && (
                              <Badge variant="success" className="text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                          <Typography className="text-gray-600 text-sm">
                            {review.role} at {review.company}
                          </Typography>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-400 mr-2">
                              {renderStars(review.rating)}
                            </span>
                            <Typography className="text-gray-500 text-xs">
                              {new Date(review.date).toLocaleDateString()}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Typography variant="h3" className="text-lg font-semibold mb-3">
                      {review.title}
                    </Typography>
                    
                    <Typography className="text-gray-700 mb-4 leading-relaxed">
                      {review.text}
                    </Typography>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Button variant="outline" size="sm" className="text-gray-600">
                        👍 Helpful ({review.helpful})
                      </Button>
                      <Typography className="text-gray-500 text-xs">
                        Review #{review.id}
                      </Typography>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredReviews.length === 0 && (
                <div className="text-center py-12">
                  <Typography className="text-gray-500">
                    No reviews found matching your criteria.
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <Typography variant="h2" className="text-3xl font-bold mb-4 text-white">
              Join Our Happy Customers
            </Typography>
            <Typography className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Experience the communication platform trusted by 500+ companies worldwide.
            </Typography>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100">
                🚀 Start Free Trial
              </Button>
              <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
                📞 Schedule Demo
              </Button>
            </div>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
};

export default ReviewsPage;