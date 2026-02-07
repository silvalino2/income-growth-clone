import { ArrowRight } from "lucide-react";

const services = [
  {
    image: "https://income-growth.org/wp-content/uploads/2024/06/forex.png",
    title: "Forex Investment Services",
    description: "Investing in the forex market can be highly rewarding, but it requires the right partner to navigate its complexities. Join us today and take the first step towards a prosperous future in forex trading."
  },
  {
    image: "https://income-growth.org/wp-content/uploads/2024/06/stock-exchange.png",
    title: "Stock Investment Services",
    description: "Our company provides a comprehensive global stock investment package that combines expertise, advanced tools, personalized strategies, and exceptional support."
  },
  {
    image: "https://income-growth.org/wp-content/uploads/2024/06/cryptocurrency.png",
    title: "Digital Currency",
    description: "INCOME-GROWTH.ORG has a proven track record of success in the USDT market. Our history of success is a testament to our expertise, dedication, and the effectiveness of our USDT package."
  },
  {
    image: "https://income-growth.org/wp-content/uploads/2024/06/contract.png",
    title: "Real Estate Investments",
    description: "At INCOME-GROWTH.ORG, we are committed to providing a comprehensive real estate investment package that opens doors to lucrative opportunities, particularly in the robust markets of the USA and Canada."
  },
  {
    image: "https://income-growth.org/wp-content/uploads/2024/06/commodities.png",
    title: "Commodities Trading Services",
    description: "Commodities, such as gold, oil, and agricultural products, tend to increase in value during inflationary periods. Our commodities package is designed to help you protect your wealth in times of rising prices."
  }
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-2 uppercase tracking-wider">
            Our Services
          </p>
          <h2 className="section-heading mb-4">
            Our spectrum of comprehensive services
          </h2>
          <p className="section-subheading">
            Designed to empower you on your financial journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={service.title}
              className="card-dark group hover:border-primary/50 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-20 h-20 mb-6">
                <img 
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-4 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              <a 
                href="#plans"
                className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:gap-3 transition-all"
              >
                Read More
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
