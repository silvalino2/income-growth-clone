import { Star } from "lucide-react";
import profile1 from "@/assets/profile-1.png";
import profile2 from "@/assets/profile-2.png";
import profile3 from "@/assets/profile-3.png";
import profile4 from "@/assets/profile-4.png";
import profile5 from "@/assets/profile-5.png";
import profile6 from "@/assets/profile-6.png";

const testimonials = [
  {
    image: profile1,
    name: "Nolan S.",
    text: "INCOME-GROWTH.COM has been invaluable in guiding me through the ever-changing financial markets. Their tailored investment solutions have not only safeguarded my assets but also fostered substantial growth."
  },
  {
    image: profile2,
    name: "Micheal T.",
    text: "As a busy professional, I don't have the time to closely manage my investments. Thankfully, INCOME-GROWTH.COM takes care of everything with precision and expertise. I trust them completely with my financial future."
  },
  {
    image: profile3,
    name: "Noah G.",
    text: "The team at INCOME-GROWTH.COM is not only knowledgeable about the financial markets but also incredibly responsive to my needs as a client. It's refreshing to work with a firm that truly values customer satisfaction."
  },
  {
    image: profile4,
    name: "George L.",
    text: "If you're looking for a financial firm that truly cares about your success, look no further than INCOME-GROWTH.COM. Their dedication to client satisfaction is unmatched in the industry."
  },
  {
    image: profile5,
    name: "Hilarry H.",
    text: "Working with INCOME-GROWTH.COM has been a game-changer for me. Their innovative approach to wealth management has helped me achieve financial success beyond my wildest dreams."
  },
  {
    image: profile6,
    name: "Alexander L.",
    text: "What sets INCOME-GROWTH.COM apart is their commitment to transparency and integrity. I always feel confident knowing that my investments are being managed ethically and responsibly."
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-heading mb-4">
            Our Testimonials
          </h2>
          <p className="section-subheading">
            Read below to know what people say about our service. In short, they are absolutely loving it
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="testimonial-card animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-heading font-semibold">{testimonial.name}</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
