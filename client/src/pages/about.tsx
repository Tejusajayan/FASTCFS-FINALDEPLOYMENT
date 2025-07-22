import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Award, Users, Globe, Shield, Clock } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import cfo from "@assets/RENJIT.jpg";
import boss from "@assets/Kannan.jpg";
import gm from "@assets/Sreekumar.jpg";
import aboutvessel from "@/assets/ABOUT_US.jpg";
import favi from "@/assets/favicon.ico";

const stats = [
	{ label: "Years of Experience", value: "7", icon: Clock },
	{ label: "African Countries", value: "25+", icon: Globe },
	{ label: "Cargo Delivered", value: "50K+", icon: CheckCircle },
	{ label: "Team Members", value: "100+", icon: Users },
];

const values = [
	{
		icon: Shield,
		title: "Reliability",
		description:
			"Consistent and dependable service delivery across all our operations",
	},
	{
		icon: Award,
		title: "Excellence",
		description:
			"Committed to maintaining the highest standards in logistics services",
	},
	{
		icon: Users,
		title: "Partnership",
		description:
			"Building long-term relationships with our clients and partners",
	},
	{
		icon: Globe,
		title: "Global Reach",
		description: "Extensive network connecting Dubai with African markets",
	},
];

const certifications = [
	"IATA Certified Agent",
	"FIATA Member",
	"NAFL Member"
];

export default function AboutPage() {
	// Fetch SEO meta for this page
	const { data: seo } = useQuery({
		queryKey: ["/api/seo", "about"],
		queryFn: async () => {
			const res = await fetch("/api/seo/about");
			if (!res.ok) return null;
			return res.json();
		},
	});

	return (
		<div className="min-h-screen bg-white">
			<Helmet>
				<title>{seo?.title || "About FAST CFS"}</title>
				<meta
					name="description"
					content={
						seo?.description ||
						"Leading logistics and freight forwarding excellence, connecting Dubai with Africa through innovative solutions and unwavering commitment to our clients."
					}
				/>
				{seo?.keywords && <meta name="keywords" content={seo.keywords} />}
				{seo?.ogImage && (
					<meta property="og:image" content={seo.ogImage} />
				)}
				<meta property="og:title" content={seo?.title || "About FAST CFS"} />
				<meta
					property="og:description"
					content={
						seo?.description ||
						"Leading logistics and freight forwarding excellence, connecting Dubai with Africa through innovative solutions and unwavering commitment to our clients."
					}
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://fastcfs.com/about" />
				<link rel="icon" type="image/x-icon" href={favi} />
			</Helmet>
			<Header />

			<div className="pt-16">
				{/* Hero Section */}
				<section className="bg-fastblue py-20">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center text-white">
							<h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
								About FAST CFS
							</h1>
							<p className="text-xl text-africangold max-w-3xl mx-auto">
								Leading logistics and freight forwarding excellence, connecting
								Dubai with Africa through innovative solutions and unwavering
								commitment to our clients.
							</p>
						</div>
					</div>
				</section>

				{/* Company Overview */}
				<section className="py-20">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
							<div className="space-y-6">
								<div>
									<Badge className="bg-fast-blue/10 text-fast-blue mb-4">
										Est. 2017
									</Badge>
									<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
										Your Trusted Logistics Partner
									</h2>
								</div>
								<p className="text-lg text-gray-600 leading-relaxed">
									Since our establishment in 2017, FAST CFS has grown from a
									Dubai-based startup to become one of the region's most trusted
									logistics and freight forwarding companies. Our expertise spans
									across ocean freight, air cargo, land transportation, and
									comprehensive supply chain solutions.
								</p>
								<p className="text-lg text-gray-600 leading-relaxed">
									With strategic locations across Africa and a deep understanding
									of regional markets, we provide seamless logistics solutions that
									help businesses expand their reach and optimize their supply
									chains.
								</p>
								<div className="flex flex-col sm:flex-row gap-4">
									<Link
										href="/services"
										onClick={() =>
											window.scrollTo({ top: 0, behavior: "instant" })
										}
									>
										<Button className="bg-fast-blue hover:bg-fast-blue-dark">
											Our Services
										</Button>
									</Link>
									<Link
										href="/contact"
										onClick={() =>
											window.scrollTo({ top: 0, behavior: "instant" })
										}
									>
										<Button
											variant="outline"
											className="border-fast-blue text-fast-blue hover:bg-fast-blue hover:text-white"
										>
											Get in Touch
										</Button>
									</Link>
								</div>
							</div>

							<div className="relative">
								<img
									src={aboutvessel}
									alt="Professional team meeting in modern office"
									className="rounded-2xl shadow-2xl w-full"
									loading="lazy"
								/>
								<div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl">
									<div className="text-center">
										<div className="text-2xl font-bold text-fast-blue">25+</div>
										<div className="text-sm text-gray-600">
											Countries Served
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Stats Section */}
				<section className="py-20 bg-gray-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Delivering Excellence Across Africa
							</h2>
							<p className="text-xl text-gray-600">
								Our track record speaks for itself
							</p>
						</div>

						<div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
							{stats.map((stat, index) => {
								const Icon = stat.icon;
								return (
									<Card
										key={index}
										className="text-center hover:shadow-lg transition-shadow"
									>
										<CardContent className="p-8">
											<div className="w-16 h-16 bg-fast-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
												<Icon className="h-8 w-8 text-fast-blue" />
											</div>
											<div className="text-3xl font-bold text-fast-blue mb-2">
												{stat.value}
											</div>
											<div className="text-gray-600">{stat.label}</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				</section>

				{/* Mission & Vision */}
				<section className="py-20">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
							<Card className="border-l-4 border-l-fast-blue">
								<CardContent className="p-8">
									<h3 className="text-2xl font-bold text-gray-900 mb-4">
										Our Mission
									</h3>
									<p className="text-gray-600 leading-relaxed">
										To provide innovative, reliable, and cost-effective logistics
										solutions that enable businesses to thrive in the global
										marketplace. We are committed to excellence in service
										delivery, fostering long-term partnerships, and contributing
										to the economic growth of the regions we serve.
									</p>
								</CardContent>
							</Card>

							<Card className="border-l-4 border-l-african-gold">
								<CardContent className="p-8">
									<h3 className="text-2xl font-bold text-gray-900 mb-4">
										Our Vision
									</h3>
									<p className="text-gray-600 leading-relaxed">
										To be the leading logistics and freight forwarding company
										connecting Dubai with Africa, recognized for our innovation,
										reliability, and commitment to sustainable business practices
										that create value for all stakeholders.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Values Section */}
				<section className="py-20 bg-gray-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Our Values
							</h2>
							<p className="text-xl text-gray-600">
								The principles that guide everything we do
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							{values.map((value, index) => {
								const Icon = value.icon;
								return (
									<Card
										key={index}
										className="text-center hover:shadow-lg transition-shadow"
									>
										<CardContent className="p-6">
											<div className="w-16 h-16 bg-african-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
												<Icon className="h-8 w-8 text-african-gold" />
											</div>
											<h3 className="text-lg font-semibold text-gray-900 mb-3">
												{value.title}
											</h3>
											<p className="text-gray-600 text-sm">
												{value.description}
											</p>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				</section>

				{/* Leadership Team */}
				<section className="py-20">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Leadership Team
							</h2>
							<p className="text-xl text-gray-600">
								Experienced professionals driving our success
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{[
								{
									name: "Renjit Gopakumar",
									position: "Chief Financial Officer",
									image: cfo,
								},
								{
									name: "Kannan Chandran",
									position: "Managing Director",
									image: boss,
								},
								{
									name: "Sreekumar",
									position: "General Manager",
									image: gm,
								},
							].map((leader, index) => (
								<Card
									key={index}
									className="text-center hover:shadow-lg transition-shadow"
								>
									<CardContent className="p-6">
										<div className="flex justify-center mb-4">
											<img
												src={leader.image}
												alt={leader.name}
												className="w-24 h-24 rounded-full object-cover object-top bg-white p-1 shadow"
												loading="lazy"
											/>
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											{leader.name}
										</h3>
										<p className="text-gray-600">{leader.position}</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* Certifications */}
				<section className="py-20 bg-gray-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Certifications & Compliance
							</h2>
							<p className="text-xl text-gray-600">
								Maintaining the highest industry standards
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{certifications.map((cert, index) => (
								<Card
									key={index}
									className="hover:shadow-md transition-shadow"
								>
									<CardContent className="p-4">
										<div className="flex items-center space-x-3">
											<CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
											<span className="text-gray-700">{cert}</span>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-gradient-to-r from-fast-blue to-fast-blue-dark">
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h2 className="text-3xl md:text-4xl font-bold text-fastblue mb-6">
							Ready to Partner With Us?
						</h2>
						<p className="text-xl text-fastbluelight mb-8">
							Let us help you streamline your logistics operations and expand your
							business across Africa.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/contact"
								onClick={() =>
									window.scrollTo({ top: 0, behavior: "instant" })
								}
							>
								<Button
									size="lg"
									className="bg-african-gold hover:bg-yellow-500 text-white"
								>
									Get Started Today
								</Button>
							</Link>
							<Link
								href="/services"
								onClick={() =>
									window.scrollTo({ top: 0, behavior: "instant" })
								}
							>
								<Button
									size="lg"
									variant="outline"
									className="border-fastblue text-fastblue hover:bg-fastblue hover:text-white"
								>
									Explore Our Services
								</Button>
							</Link>
						</div>
					</div>
				</section>
			</div>

			<Footer />
		</div>
	);
}
