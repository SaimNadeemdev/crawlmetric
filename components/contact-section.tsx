"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, MessageSquare, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { GradientHeading } from "@/components/ui/gradient-heading"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
})

type FormData = z.infer<typeof formSchema>

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Form submitted:", data)

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
        className: "bg-green-500 text-white",
      })

      form.reset()
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative py-20 px-4 md:px-6 overflow-hidden">
      {/* iOS-style background with dotted pattern */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      
      {/* iOS-style glow effects */}
      <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-300/20 blur-[120px]"></div>
      <div className="absolute right-1/4 bottom-1/3 h-[350px] w-[350px] translate-x-1/2 translate-y-1/2 transform rounded-full bg-indigo-300/20 blur-[100px]"></div>

      <div className="container relative z-10 mx-auto max-w-7xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Get in Touch
          </motion.div>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent">
              Ready to Transform Your SEO Strategy?
            </span>
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Contact us today to learn how our cutting-edge SEO tools can help elevate your search presence and drive
            measurable results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Contact Form - iOS style */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="transition-all duration-300"
          >
            <div className="relative">
              {/* iOS-style blur background */}
              <div className="absolute inset-0 backdrop-blur-xl bg-white/70 rounded-3xl"></div>
              
              <Card className="border border-gray-100 shadow-sm bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-gray-900">Send us a Message</CardTitle>
                  <CardDescription className="text-gray-600">Fill out the form below and we'll get back to you shortly.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <motion.div
                                  animate={{ 
                                    scale: focusedField === 'name' ? 1.1 : 1,
                                    color: focusedField === 'name' ? '#3b82f6' : '#6b7280'
                                  }}
                                  className="absolute left-3 top-3 z-10"
                                >
                                  <User className="h-4 w-4" />
                                </motion.div>
                                <Input 
                                  className="pl-9 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800" 
                                  placeholder="Your name" 
                                  {...field} 
                                  onFocus={() => setFocusedField('name')}
                                  onBlur={() => setFocusedField(null)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <motion.div
                                  animate={{ 
                                    scale: focusedField === 'email' ? 1.1 : 1,
                                    color: focusedField === 'email' ? '#3b82f6' : '#6b7280'
                                  }}
                                  className="absolute left-3 top-3 z-10"
                                >
                                  <Mail className="h-4 w-4" />
                                </motion.div>
                                <Input 
                                  className="pl-9 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800" 
                                  placeholder="your@email.com" 
                                  type="email" 
                                  {...field} 
                                  onFocus={() => setFocusedField('email')}
                                  onBlur={() => setFocusedField(null)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Subject</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <motion.div
                                  animate={{ 
                                    scale: focusedField === 'subject' ? 1.1 : 1,
                                    color: focusedField === 'subject' ? '#3b82f6' : '#6b7280'
                                  }}
                                  className="absolute left-3 top-3 z-10"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </motion.div>
                                <Input 
                                  className="pl-9 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800" 
                                  placeholder="What's this about?" 
                                  {...field} 
                                  onFocus={() => setFocusedField('subject')}
                                  onBlur={() => setFocusedField(null)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us how we can help..."
                                className="min-h-[150px] resize-none rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800"
                                {...field}
                                onFocus={() => setFocusedField('message')}
                                onBlur={() => setFocusedField(null)}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-300 hover:from-blue-700 hover:to-blue-400 text-white font-medium py-2.5 shadow-md hover:shadow-lg transition-all duration-200" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="relative">
              {/* iOS-style blur background */}
              <div className="absolute inset-0 backdrop-blur-xl bg-white/70 rounded-3xl"></div>
              
              <Card className="border border-gray-100 shadow-sm bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-gray-900">Why Choose Us?</CardTitle>
                  <CardDescription className="text-gray-600">Industry-leading SEO tools backed by expert support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {/* Feature 1 */}
                    <motion.div 
                      className="flex items-start space-x-4"
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white shadow-md">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Real-Time Analytics</h4>
                        <p className="text-sm text-gray-600">
                          Monitor your SEO performance with instant updates and alerts
                        </p>
                      </div>
                    </motion.div>
                    
                    {/* Feature 2 */}
                    <motion.div 
                      className="flex items-start space-x-4"
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white shadow-md">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Fast Implementation</h4>
                        <p className="text-sm text-gray-600">
                          Get started quickly with our intuitive tools and interfaces
                        </p>
                      </div>
                    </motion.div>
                    
                    {/* Feature 3 */}
                    <motion.div 
                      className="flex items-start space-x-4"
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white shadow-md">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Expert Support</h4>
                        <p className="text-sm text-gray-600">24/7 access to our team of SEO specialists</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="space-y-4">
                      {/* Contact email */}
                      <motion.div 
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <Mail className="h-5 w-5" />
                        </div>
                        <span className="text-gray-900">support@keywordtracker.com</span>
                      </motion.div>
                      
                      {/* Contact phone */}
                      <motion.div 
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-900">+1 (555) 123-4567</span>
                      </motion.div>
                      
                      {/* Contact address */}
                      <motion.div 
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-900">123 SEO Street, San Francisco, CA 94105</span>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
