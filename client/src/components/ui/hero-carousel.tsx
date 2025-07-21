import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Ship, Plane, Truck } from "lucide-react";
import { useLocation } from "wouter";
import africaimg from "@/assets/IMG.jpg";
import airfrieght from "@/assets/AIR_FREIGHT.jpg";


const heroSlides = [
	{
		id: 1,
		title: "Connecting Dubai, India & China to Africa",
		subtitle: "Professional logistics and freight forwarding services",
		description:
			"Reliable cargo tracking, seamless shipping solutions, and comprehensive support across the African continent.",
		image: africaimg,
		icon: Ship,
		primaryAction: "Track Your Cargo",
		secondaryAction: "Our Services",
	},
	{
		id: 2,
		title: "Fast & Reliable Air Freight",
		subtitle: "Express delivery across African destinations",
		description:
			"Time-sensitive shipments delivered with speed and security. Door-to-door service with real-time tracking.",
		image: airfrieght,
		icon: Plane,
		primaryAction: "Get Quote",
		secondaryAction: "Learn More",
	},
	{
		id: 3,
		title: "Ocean Freight Excellence",
		subtitle: "Cost-effective shipping solutions",
		description:
			"Competitive rates for cargo shipments across African ports with comprehensive tracking and support.",
		image:
			"https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
		icon: Truck,
		primaryAction: "Contact Us",
		secondaryAction: "View Rates",
	},
];

export default function HeroCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [, setLocation] = useLocation();

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
		}, 6000);

		return () => clearInterval(timer);
	}, []);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
	};

	const slide = heroSlides[currentSlide];
	const Icon = slide.icon;

	return (
		<section className="relative pt-16 bg-gradient-to-br from-fast-blue to-fast-blue-dark overflow-hidden min-h-[600px]">
			{/* African geometric pattern overlay */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-20 left-10 w-32 h-32 border-4 border-white transform rotate-45"></div>
				<div className="absolute top-40 right-20 w-24 h-24 border-4 border-white transform rotate-12"></div>
				<div className="absolute bottom-20 left-1/4 w-16 h-16 border-4 border-white transform -rotate-45"></div>
			</div>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="text-white space-y-6">
						<div className="flex items-center space-x-3 mb-4">
							<div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
								<Icon className="h-6 w-6 text-white" />
							</div>
							<span className="text-africangold text-sm font-medium">
								{slide.subtitle}
							</span>
						</div>

						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white-contrast">
							{slide.title.split(" ").map((word, index) => (
								<span
									key={index}
									className={
										word === "Africa"
											? "text-africangold"
											: "text-fastblue"
									}
								>
									{word}{" "}
								</span>
							))}
						</h1>

						<p className="text-xl text-fastbluelight">
							{slide.description}
						</p>

						<div className="flex flex-col sm:flex-row gap-4 pt-4">
							<Button
								className="bg-africangold hover:bg-yellow-600 text-white px-8 py-4 text-lg font-semibold shadow-lg"
								onClick={() => {
									if (slide.primaryAction === "Track Your Cargo") {
										setLocation("/cargo-tracking");
									} else if (slide.primaryAction === "Get Quote") {
										setLocation("/contact");
									} else if (slide.primaryAction === "Contact Us") {
										setLocation("/contact");
									}
								}}
							>
								{slide.primaryAction}
							</Button>
							<Button
								variant="outline"
								className="border-2 border-white text-white bg-fastblue hover:bg-fastbluelight hover:text-white px-8 py-4 text-lg font-semibold"
								onClick={() => {
									if (
										slide.secondaryAction === "Our Services" ||
										slide.secondaryAction === "Learn More" ||
										slide.secondaryAction === "View Rates"
									) {
										setLocation("/services");
									}
								}}
							>
								{slide.secondaryAction}
							</Button>
						</div>
					</div>

					<div className="relative">
						<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 transition-all duration-500">
							<img
								src={slide.image}
								alt={slide.title}
								className="rounded-xl shadow-2xl w-full h-auto transition-opacity duration-500"
								loading="lazy"
							/>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={prevSlide}
						className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white border border-white/30"
					>
						<ChevronLeft className="h-5 w-5 text-black" />
					</Button>

					<div className="flex space-x-2">
						{heroSlides.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentSlide(index)}
								className={`w-3 h-3 rounded-full transition-all ${
									index === currentSlide
										? "bg-fastblue"
										: "bg-fastblue/50 hover:bg-fastblue/70"
								}`}
							/>
						))}
					</div>

					<Button
						variant="ghost"
						size="icon"
						onClick={nextSlide}
						className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white border border-white/30"
					>
						<ChevronRight className="h-5 w-5 text-black" />
					</Button>
				</div>
			</div>
		</section>
	);
}
