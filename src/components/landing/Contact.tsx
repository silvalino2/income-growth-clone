import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: ""
    });
  };

  return (
    <section id="contact" className="py-24 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="section-heading mb-4">Contact us</h2>
            <p className="text-muted-foreground mb-8">
              Connect with us and our team of professional investors will help you explore all our investment options and give you in-depth analytical details and views to maximize your investment profits.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">FIRST NAME</label>
                  <Input 
                    className="input-dark"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">LAST NAME</label>
                  <Input 
                    className="input-dark"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">EMAIL</label>
                <Input 
                  type="email"
                  className="input-dark"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">PHONE NUMBER</label>
                <Input 
                  type="tel"
                  className="input-dark"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">WHAT DO YOU HAVE IN MIND</label>
                <Textarea 
                  className="input-dark min-h-[120px]"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />
              </div>

              <Button type="submit" className="btn-hero">
                Submit
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="section-heading mb-4">Contact us</h2>
            <p className="text-muted-foreground mb-8">
              Connect with us and our team of professional investors will help you explore all our investment options and give you in-depth analytical details and views to maximize your investment profits.
            </p>

            <div className="space-y-6">
              <a 
                href="https://wa.me/+19545738063"
                className="card-dark flex items-center gap-4 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">WhatsApp</p>
                  <p className="font-medium">+19545738063</p>
                </div>
              </a>

              <a 
                href="mailto:service@income-growth.org"
                className="card-dark flex items-center gap-4 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-medium">service@income-growth.org</p>
                </div>
              </a>

              <div className="card-dark flex items-center gap-4">
                <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Address</p>
                  <p className="font-medium">288/290 Torquay Rd, Paignton Devon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
