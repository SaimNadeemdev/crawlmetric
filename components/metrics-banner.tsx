export function MetricsBanner() {
  return (
    <section className="w-full bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-4xl font-bold">2.4M+</h3>
            <p className="text-gray-400">Keywords Tracked</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold">98%</h3>
            <p className="text-gray-400">Client Retention</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold">43%</h3>
            <p className="text-gray-400">Avg. Traffic Increase</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold">24/7</h3>
            <p className="text-gray-400">Rank Monitoring</p>
          </div>
        </div>
      </div>
    </section>
  )
}

