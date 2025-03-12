"use client"

import type React from "react"

import { AnimatePresence, motion, useSpring } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import {
  ArrowRight,
  BarChart2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LineChart,
  Maximize2,
  Plus,
  Quote,
  SearchCheck,
  Star,
  TrendingUp,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { fsMe } from "@/lib/fonts"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Service icons mapping
const serviceIcons = {
  "keyword-tracking": BarChart2,
  "seo-audit": SearchCheck,
  "keyword-research": LineChart,
  "rank-monitoring": TrendingUp,
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
    logo: "https://images.unsplash.com/photo-1472851294608-ac291c95aaa9?w=250&h=80&fit=crop&crop=center&q=80",
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
      avatar: "https://images.unsplash.com/photo-1500648767791-fa1923c43e?w=60&h=60&fit=crop&q=80",
    },
  },
  {
    id: 5,
    client: "HealthTech Solutions",
    industry: "Healthcare",
    service: "keyword-tracking",
    logo: "https://images.unsplash.com/photo-1505751172876-fa1923c528?w=250&h=80&fit=crop&crop=center&q=80",
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
  const [hovered, setHovered] = useState(-1)
  const [visibleStars, setVisibleStars] = useState(0)

  useEffect(() => {
    // Animate stars appearing one by one
    const interval = setInterval(() => {
      setVisibleStars((prev) => {
        if (prev < rating) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 150) // Time between each star appearing

    return () => clearInterval(interval)
  }, [rating])

  return (
    <div className="flex items-center" onMouseLeave={() => setHovered(-1)}>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          onMouseEnter={() => setHovered(i)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: i < visibleStars ? 1 : 0.3,
            scale: i < visibleStars ? 1 : 0.8,
            y: i < visibleStars ? 0 : 10,
          }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 400,
            damping: 17,
            mass: 0.8,
          }}
        >
          <Star
            className={cn(
              "h-4 w-4 mx-0.5",
              i <= hovered
                ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.3)]"
                : i < rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200",
            )}
            strokeWidth={1.5}
          />
        </motion.div>
      ))}
    </div>
  )
}

// Metric item component
const MetricItem = ({ label, value, index }: { label: string; value: string; index: number }) => {
  // Determine color based on value (positive, negative, or neutral)
  const getValueColor = () => {
    if (value.startsWith("+")) return "from-emerald-500 to-teal-500"
    if (value.startsWith("-")) return "from-rose-500 to-pink-500"
    return "from-blue-600 to-indigo-600"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "rounded-2xl p-3 text-center",
        "bg-gradient-to-b from-white to-gray-50",
        "border border-gray-100",
        "shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05),_0_0_0_1px_rgba(0,0,0,0.02)]",
        "backdrop-blur-sm",
        "z-10 relative",
      )}
      whileHover={{
        y: -5,
        boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)",
        transition: { duration: 0.2 },
      }}
    >
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={cn("text-base font-semibold bg-clip-text text-transparent", "bg-gradient-to-r", getValueColor())}>
        {value}
      </p>
    </motion.div>
  )
}

// Premium testimonial card component with advanced micro-interactions
const TestimonialCard = ({ testimonial }: { testimonial: (typeof testimonials)[0] }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const ServiceIcon = serviceIcons[testimonial.service as keyof typeof serviceIcons]
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  // Advanced 3D effect for card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const moveX = (x - centerX) / 25
    const moveY = (y - centerY) / 25

    setRotation({ x: -moveY, y: moveX })
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
    setIsHovering(false)
  }

  // Smooth rotation with spring physics
  const rotateX = useSpring(rotation.x, { stiffness: 300, damping: 30 })
  const rotateY = useSpring(rotation.y, { stiffness: 300, damping: 30 })

  useEffect(() => {}, [rotation, rotateX, rotateY])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
      whileHover={{ y: -5 }}
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1200,
          transformStyle: "preserve-3d",
          boxShadow: isHovering
            ? "0 20px 40px -20px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02), 0 0 20px 0 rgba(0,0,0,0.03)"
            : "0 10px 30px -15px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)",
        }}
        className={cn(
          "h-full overflow-hidden rounded-3xl bg-white",
          "border border-gray-100 transition-all duration-300",
          "will-change-transform",
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Premium glass effect top highlight */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
          style={{ transform: "translateZ(1px)" }}
        />

        <div className="flex h-full flex-col p-8">
          {/* Header with logo and rating */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Removed company picture as requested */}
              <div style={{ transform: "translateZ(15px)" }}>
                <h3 className="font-semibold text-gray-900">{testimonial.client}</h3>
                <p className="text-xs text-gray-500">{testimonial.industry}</p>
              </div>
            </div>
            <div style={{ transform: "translateZ(15px)" }}>
              <StarRating rating={testimonial.rating} />
            </div>
          </div>

          {/* Service badge */}
          <motion.div
            style={{ transform: "translateZ(25px)" }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Badge
              variant="outline"
              className={cn(
                "mb-5 w-fit rounded-full px-4 py-1.5 text-xs font-medium",
                "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700",
                "border border-gray-200/80",
                "shadow-sm shadow-blue-100/20",
              )}
            >
              <ServiceIcon className="mr-1.5 h-3 w-3" strokeWidth={2} />
              {testimonial.service
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Badge>
          </motion.div>

          {/* Quote */}
          <div className="relative mb-5 flex-1" style={{ transform: "translateZ(10px)" }}>
            <Quote className="absolute -left-1 -top-1 h-5 w-5 rotate-180 text-blue-100" strokeWidth={1.5} />
            <p className="pl-5 text-sm text-gray-600 leading-relaxed tracking-wide">{testimonial.quote}</p>
          </div>

          {/* Expand button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center justify-center w-full py-2.5 mb-5 text-sm font-medium",
              "rounded-full border border-gray-200",
              "bg-gradient-to-r from-gray-50 to-gray-100",
              "text-gray-700 shadow-sm",
              "transition-all duration-200",
            )}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 12px -4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)",
              borderColor: "rgba(0,0,0,0.08)",
            }}
            whileTap={{ scale: 0.98 }}
            style={{ transform: "translateZ(20px)" }}
          >
            <span>{isExpanded ? "Hide metrics" : "View metrics"}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="ml-1.5"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </motion.div>
          </motion.button>

          {/* Metrics */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 overflow-visible"
                style={{ transform: "translateZ(15px)" }}
              >
                <div className="grid grid-cols-3 gap-3 relative z-10">
                  {testimonial.metrics.map((metric, idx) => (
                    <MetricItem key={idx} label={metric.label} value={metric.value} index={idx} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Person */}
          <div className="mt-auto flex items-center gap-3 pt-2" style={{ transform: "translateZ(15px)" }}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Avatar className={cn("h-10 w-10 border-2 border-white", "ring-2 ring-gray-100", "shadow-md")}>
                <AvatarImage src={testimonial.person.avatar} alt={testimonial.person.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600">
                  {testimonial.person.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{testimonial.person.name}</p>
              <p className="text-xs text-gray-500">{testimonial.person.role}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Premium animated section title with letter-by-letter animation
export const AnimatedTitle = ({ children }: { children: React.ReactNode }) => {
  const text = children as string
  const letters = Array.from(text)

  return (
    <h2 className={`mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl section-title ${fsMe.className}`}>
      <span className="sr-only">{text}</span>
      <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent inline-block">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.1 + index * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </span>
    </h2>
  )
}

// Main component
export function ClientSuccessSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const [industry, setIndustry] = useState("all")
  const [activeIndex, setActiveIndex] = useState(0)
  const [api, setApi] = useState<CarouselApi>()

  const filteredTestimonials = testimonials.filter((t) => industry === "all" || t.industry === industry)

  // Handle navigation dot clicks
  const handleDotClick = useCallback(
    (index: number) => {
      if (api) {
        api.scrollTo(index)
      }
    },
    [api],
  )

  // Update activeIndex when the carousel changes
  useEffect(() => {
    if (!api) {
      return
    }

    const handleSelect = () => {
      setActiveIndex(api.selectedScrollSnap())
    }

    api.on("select", handleSelect)

    // Cleanup
    return () => {
      api.off("select", handleSelect)
    }
  }, [api])

  return (
    <section className="relative py-28 md:py-36 overflow-hidden">
      {/* Background with white base */}
      <div className="absolute inset-0 bg-white" />

      {/* Dotted background pattern matching hero section */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* iOS-style glow effects */}
      <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-300/20 blur-[120px]"></div>
      <div className="absolute right-1/4 bottom-1/3 h-[350px] w-[350px] translate-x-1/2 translate-y-1/2 transform rounded-full bg-indigo-300/20 blur-[100px]"></div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          {/* Premium badge */}
          <motion.div
            className="inline-block mb-4"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1,
            }}
          >
            <span
              className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-full",
                "text-sm font-medium text-blue-600",
                "bg-gradient-to-r from-blue-50 to-indigo-50",
                "border border-blue-100/80",
                "shadow-sm shadow-blue-100/20",
              )}
            >
              <motion.span
                className="mr-2 h-2 w-2 rounded-full bg-blue-500"
                animate={{
                  opacity: [1, 0.7, 1],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              Success Stories
            </span>
          </motion.div>

          <AnimatedTitle>Trusted by Innovative Companies</AnimatedTitle>

          <motion.p
            className={cn("mx-auto max-w-2xl text-gray-600 text-lg leading-relaxed", "tracking-wide")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            See how our cutting-edge SEO tools have helped businesses across industries achieve measurable growth and
            sustainable results.
          </motion.p>
        </motion.div>

        {/* Industry filter tabs */}
        <div className="mb-16">
          <Tabs defaultValue="all" value={industry} onValueChange={setIndustry} className="w-full">
            <div className="flex justify-center mb-2">
              <motion.div
                className={cn(
                  "inline-flex p-1.5 rounded-full",
                  "bg-gradient-to-r from-gray-100 to-gray-50",
                  "border border-gray-200/80",
                  "shadow-inner shadow-gray-200/30",
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TabsList className="bg-transparent p-0">
                  {industries.map((ind) => (
                    <TabsTrigger
                      key={ind.id}
                      value={ind.id}
                      className={cn(
                        "rounded-full px-5 py-2.5 text-sm transition-all",
                        "data-[state=active]:bg-white data-[state=active]:text-gray-900",
                        "data-[state=active]:shadow-sm data-[state=active]:font-medium",
                        "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900",
                        "border-0",
                      )}
                      onClick={() => setActiveIndex(0)}
                    >
                      {ind.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </motion.div>
            </div>

            <TabsContent value={industry} className="mt-10 focus-visible:outline-none">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
                setApi={setApi}
              >
                <CarouselContent className="-ml-4">
                  {filteredTestimonials.map((testimonial) => (
                    <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <TestimonialCard testimonial={testimonial} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="mt-12 flex items-center justify-center gap-4">
                  {/* Navigation buttons with proper styling to ensure visibility */}
                  <Button 
                    onClick={() => api?.scrollPrev()} 
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200"
                  >
                    <ArrowRight className="h-5 w-5 rotate-180 text-blue-600" />
                  </Button>

                  {/* Navigation dots */}
                  <div className="flex items-center gap-1.5">
                    {filteredTestimonials.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          index === activeIndex ? "w-6 bg-blue-600" : "w-1.5 bg-gray-300 hover:bg-gray-400",
                        )}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  <Button 
                    onClick={() => api?.scrollNext()} 
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200"
                  >
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </Button>
                </div>
              </Carousel>
            </TabsContent>
          </Tabs>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/case-studies" className="inline-block">
            <Button
              size="lg"
              className={cn(
                "relative overflow-hidden rounded-full px-8 py-6",
                "text-base font-medium shadow-lg transition-all duration-200",
                "bg-gradient-to-r from-blue-600 to-blue-300 text-white",
                "hover:shadow-blue-200/50 hover:shadow-xl",
                "border border-blue-700/20",
              )}
            >
              {/* Button shine effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  duration: 1.5,
                  ease: "linear",
                  repeatDelay: 3,
                }}
              />

              <motion.span
                className="flex items-center relative z-10"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                View All Case Studies
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
