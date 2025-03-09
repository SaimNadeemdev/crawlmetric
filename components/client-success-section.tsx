"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { BarChart, Search, LineChart, Settings, ArrowRight, Quote, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Service icons mapping
const serviceIcons = {
  "keyword-tracking": BarChart,
  "seo-audit": Search,
  "keyword-research": LineChart,
  "rank-monitoring": Settings,
}

// Case study data with real images
const testimonials = [
  {
    id: 1,
    client: "TechVision Inc.",
    industry: "SaaS",
    service: "keyword-tracking",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=250&h=80&fit=crop&crop=center&q=80",
    rating: 5,
    quote:
      "The keyword tracking tool has transformed our SEO strategy. We've seen a 43% increase in organic traffic within just three months of implementation. The insights provided have been invaluable for our content team.",
    metrics: [
      { label: "Organic Traffic", value: "+43%" },
      { label: "Keyword Rankings", value: "+388%" },
      { label: "Conversion Rate", value: "+81%" },
    ],
    person: {
      name: "Sarah Johnson",
      role: "Marketing Director",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&q=80",
    },
  },
  {
    id: 2,
    client: "Growth Partners",
    industry: "Marketing Agency",
    service: "seo-audit",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=250&h=80&fit=crop&crop=center&q=80",
    rating: 5,
    quote:
      "The SEO audit identified critical issues we had overlooked for years. After implementing the recommendations, our site's visibility improved dramatically. Page load speed decreased by 57% and our indexable pages more than doubled.",
    metrics: [
      { label: "Page Load Speed", value: "-57%" },
      { label: "Indexable Pages", value: "+114%" },
      { label: "Organic Visibility", value: "+139%" },
    ],
    person: {
      name: "Michael Chen",
      role: "SEO Specialist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&q=80",
    },
  },
  {
    id: 3,
    client: "MediaForge",
    industry: "Content Publishing",
    service: "keyword-research",
    logo: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=250&h=80&fit=crop&crop=center&q=80",
    rating: 4,
    quote:
      "The keyword research tool helped us discover niche topics that our competitors weren't covering. This has become our content edge in a crowded market. We've increased our featured snippets by 750% and significantly improved our average position.",
    metrics: [
      { label: "Content Gap Coverage", value: "+239%" },
      { label: "Avg. Position", value: "6.2 (from 18.4)" },
      { label: "Featured Snippets", value: "+750%" },
    ],
    person: {
      name: "Emma Rodriguez",
      role: "Content Strategist",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&q=80",
    },
  },
  {
    id: 4,
    client: "RetailNova",
    industry: "E-commerce",
    service: "rank-monitoring",
    logo: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=250&h=80&fit=crop&crop=center&q=80",
    rating: 5,
    quote:
      "Rank monitoring alerts have saved us countless times from sudden ranking drops. We can now respond to algorithm changes within hours instead of weeks. Our recovery time after algorithm updates has decreased by 86%, which has been crucial for our business.",
    metrics: [
      { label: "Recovery Time", value: "-86%" },
      { label: "Revenue Impact", value: "-3% (from -18%)" },
      { label: "Ranking Stability", value: "+107%" },
    ],
    person: {
      name: "David Wilson",
      role: "E-commerce Manager",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&q=80",
    },
  },
  {
    id: 5,
    client: "HealthTech Solutions",
    industry: "Healthcare",
    service: "keyword-tracking",
    logo: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=250&h=80&fit=crop&crop=center&q=80",
    rating: 5,
    quote:
      "As a healthcare provider, we needed to ensure our content was visible to the right audience. The keyword tracking tool helped us optimize our medical content for both search engines and patients. Our organic traffic has increased by 67% in just 4 months.",
    metrics: [
      { label: "Organic Traffic", value: "+67%" },
      { label: "Patient Inquiries", value: "+42%" },
      { label: "Local Visibility", value: "+95%" },
    ],
    person: {
      name: "Dr. Lisa Park",
      role: "Digital Health Director",
      avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=60&h=60&fit=crop&q=80",
    },
  },
  {
    id: 6,
    client: "EduLearn Platform",
    industry: "Education",
    service: "seo-audit",
    logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=250&h=80&fit=crop&crop=center&q=80",
    rating: 4,
    quote:
      "The comprehensive SEO audit revealed critical issues with our course pages that were preventing them from ranking well. After implementing the recommendations, our student enrollment increased by 53% through organic search alone.",
    metrics: [
      { label: "Course Visibility", value: "+128%" },
      { label: "Organic Enrollments", value: "+53%" },
      { label: "Bounce Rate", value: "-42%" },
    ],
    person: {
      name: "James Thompson",
      role: "Digital Marketing Lead",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=60&h=60&fit=crop&q=80",
    },
  },
]

// Industry filters
const industries = [
  { id: "all", label: "All Industries" },
  { id: "SaaS", label: "SaaS" },
  { id: "Marketing Agency", label: "Marketing" },
  { id: "Content Publishing", label: "Publishing" },
  { id: "E-commerce", label: "E-commerce" },
  { id: "Healthcare", label: "Healthcare" },
  { id: "Education", label: "Education" },
]

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  )
}

// Testimonial card component
const TestimonialCard = ({ testimonial }: { testimonial: (typeof testimonials)[0] }) => {
  const [isHovered, setIsHovered] = useState(false)
  const ServiceIcon = serviceIcons[testimonial.service as keyof typeof serviceIcons]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="relative h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative h-full overflow-hidden rounded-xl border border-primary/20 bg-black/60 p-6 shadow-sm transition-all duration-300 hover:shadow-md backdrop-blur-sm">
        {/* Background elements */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col">
          {/* Header with logo and rating */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-20 overflow-hidden rounded-md bg-background">
                <Image
                  src={testimonial.logo || "/placeholder.svg"}
                  alt={testimonial.client}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div>
                <h3 className="font-medium">{testimonial.client}</h3>
                <p className="text-xs text-muted-foreground">{testimonial.industry}</p>
              </div>
            </div>
            <StarRating rating={testimonial.rating} />
          </div>

          {/* Service badge */}
          <Badge variant="outline" className="mb-3 w-fit bg-primary/5 text-xs font-normal text-primary">
            <ServiceIcon className="mr-1 h-3 w-3" />
            {testimonial.service
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Badge>

          {/* Quote */}
          <div className="relative mb-4 flex-1">
            <Quote className="absolute -left-1 -top-1 h-6 w-6 rotate-180 text-primary/10" />
            <p className="pl-5 text-sm italic text-muted-foreground">{testimonial.quote}</p>
          </div>

          {/* Metrics */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4 overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2">
                  {testimonial.metrics.map((metric, idx) => (
                    <div key={idx} className="rounded-lg bg-primary/10 p-2 text-center backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Person */}
          <div className="mt-auto flex items-center gap-3">
            <Avatar>
              <AvatarImage src={testimonial.person.avatar} alt={testimonial.person.name} />
              <AvatarFallback>{testimonial.person.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{testimonial.person.name}</p>
              <p className="text-xs text-muted-foreground">{testimonial.person.role}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Floating orbs background component
const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute left-[40%] top-[20%] h-[20%] w-[20%] rounded-full bg-pink-500/10 blur-3xl" />
    </div>
  )
}

// Main component
export function ClientSuccessSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const [industry, setIndustry] = useState("all")

  const filteredTestimonials = testimonials.filter((t) => industry === "all" || t.industry === industry)

  return (
    <section className="relative py-16 sm:py-24 bg-black">
      <FloatingOrbs />

      {/* Solid black background */}
      <div className="absolute inset-0 bg-black" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Success Stories
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Trusted by Innovative Companies
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            See how our cutting-edge SEO tools have helped businesses across industries achieve measurable growth and
            sustainable results.
          </p>
        </motion.div>

        {/* Industry filter tabs */}
        <div className="mt-10 flex justify-center">
          <Tabs defaultValue="all" value={industry} onValueChange={setIndustry} className="w-full max-w-4xl">
            <div className="relative">
              <div className="absolute -inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="absolute -inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="relative py-2">
                <TabsList className="h-auto w-full justify-start overflow-x-auto bg-black p-0">
                  {industries.map((ind) => (
                    <TabsTrigger
                      key={ind.id}
                      value={ind.id}
                      className="rounded-full border border-primary/20 px-4 py-1.5 text-xs 
                data-[state=active]:border-primary 
                data-[state=active]:bg-gradient-to-r 
                data-[state=active]:from-blue-500/20 
                data-[state=active]:to-purple-500/20 
                data-[state=active]:text-white"
                    >
                      {ind.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <TabsContent value={industry} className="mt-8 focus-visible:outline-none">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {filteredTestimonials.map((testimonial) => (
                    <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <TestimonialCard testimonial={testimonial} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="mt-8 flex items-center justify-center gap-2">
                  <CarouselPrevious className="static h-8 w-8 translate-y-0" />
                  <CarouselNext className="static h-8 w-8 translate-y-0" />
                </div>
              </Carousel>
            </TabsContent>
          </Tabs>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
            <Link href="/case-studies">
              View All Case Studies
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

