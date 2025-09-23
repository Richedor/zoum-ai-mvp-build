"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  MapPin,
  Truck,
  Users,
  Wifi,
  CheckCircle,
  Phone,
  Mail,
  Building,
  Star,
  Play,
  ArrowRight,
  Zap,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    vehicles: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Demo request submitted:", formData)
    // Handle demo request
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">ZoumAI</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#fonctionnalites" className="text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
                Démonstration
              </Link>
              <Link href="#temoignages" className="text-muted-foreground hover:text-foreground transition-colors">
                Témoignages
              </Link>
              <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Demander une démo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

        <div className="container mx-auto text-center max-w-6xl relative">
          <Badge variant="secondary" className="mb-8 bg-primary/10 text-primary border-primary/20">
            <Zap className="w-4 h-4 mr-2" />
            Innovation IoT pour l'Afrique
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-balance leading-tight">
            ZoumAI sécurise vos trajets et <span className="text-primary">sauve des vies</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-4xl mx-auto leading-relaxed">
            Un boîtier intelligent qui révolutionne la gestion des flottes en Afrique. Détection de fatigue, alcootest
            personnel, suivi GPS temps réel et maintenance prédictive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="px-8 py-4 text-lg bg-primary hover:bg-primary/90">
              <Play className="w-5 h-5 mr-2" />
              Voir la démonstration
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg bg-transparent border-border hover:bg-card"
            >
              Demander une présentation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Hero illustration placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-border flex items-center justify-center">
              <div className="text-center">
                <Truck className="w-24 h-24 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Illustration du boîtier ZoumAI en action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">85%</div>
              <div className="text-muted-foreground">Réduction des accidents</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">24/7</div>
              <div className="text-muted-foreground">Surveillance temps réel</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50%</div>
              <div className="text-muted-foreground">Économies maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">100+</div>
              <div className="text-muted-foreground">Flottes équipées</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Fonctionnalités révolutionnaires</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              ZoumAI combine sécurité, intelligence artificielle et simplicité pour transformer votre gestion de flotte
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border bg-card/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl mb-3">Sécurité Chauffeur</CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                Alcootest personnel, détection de fatigue et alertes temps réel pour prévenir les accidents
              </CardDescription>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border bg-card/50">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl mb-3">Suivi Temps Réel</CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                GPS précis, tableau de bord en direct et planification optimisée des trajets
              </CardDescription>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border bg-card/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl mb-3">Maintenance Prédictive</CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                Données OBD-II et alertes techniques pour anticiper les pannes avant qu'elles surviennent
              </CardDescription>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border bg-card/50">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Wifi className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl mb-3">Simplicité & Autonomie</CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                Boîtier autonome, connecté 4G/LoRa avec stockage local si pas de réseau
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">ZoumAI en action</h2>
            <p className="text-xl text-muted-foreground">
              Découvrez comment notre IA révolutionne la sécurité des flottes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-border flex items-center justify-center mb-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg text-muted-foreground">Vidéo de démonstration</p>
                <p className="text-sm text-muted-foreground">Détection fatigue et tableau de bord en direct</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="temoignages" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Ils nous font confiance</h2>
            <p className="text-xl text-muted-foreground">Témoignages de nos partenaires en Afrique de l'Ouest</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 border-border bg-card/50">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-current" />
                ))}
              </div>
              <CardDescription className="text-foreground mb-4 leading-relaxed">
                "Depuis ZoumAI, nos accidents ont diminué de 80%. Les chauffeurs sont plus vigilants et nous économisons
                sur la maintenance."
              </CardDescription>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Amadou Diallo</div>
                  <div className="text-sm text-muted-foreground">Directeur Transport, Cotonou</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card/50">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-current" />
                ))}
              </div>
              <CardDescription className="text-foreground mb-4 leading-relaxed">
                "L'interface est simple, même nos chauffeurs les moins tech l'utilisent facilement. Un vrai
                game-changer."
              </CardDescription>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold">Fatou Kone</div>
                  <div className="text-sm text-muted-foreground">Gestionnaire Flotte, Abidjan</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card/50">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-current" />
                ))}
              </div>
              <CardDescription className="text-foreground mb-4 leading-relaxed">
                "La maintenance prédictive nous a évité 3 pannes majeures ce mois. ROI atteint en 6 mois seulement."
              </CardDescription>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Ibrahim Traore</div>
                  <div className="text-sm text-muted-foreground">CEO TransAfrique, Ouagadougou</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact/Demo Form Section */}
      <section id="contact" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">Prêt à révolutionner votre flotte ?</h2>
            <p className="text-xl text-muted-foreground">
              Obtenez une présentation personnalisée de ZoumAI pour votre entreprise
            </p>
          </div>

          <Card className="p-8 border-border bg-card/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <Input
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email professionnel</label>
                  <Input
                    type="email"
                    placeholder="votre@entreprise.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Entreprise</label>
                  <Input
                    placeholder="Nom de votre entreprise"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre de véhicules</label>
                  <Input
                    placeholder="Ex: 25 véhicules"
                    value={formData.vehicles}
                    onChange={(e) => setFormData({ ...formData, vehicles: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                Obtenir une présentation gratuite
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Questions fréquentes</h2>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-border bg-card/50">
              <CardTitle className="text-lg mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-primary mr-2" />
                Sécurité des données
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Toutes les données sont chiffrées et stockées selon les standards internationaux. Conformité RGPD et
                hébergement sécurisé en Afrique.
              </CardDescription>
            </Card>

            <Card className="p-6 border-border bg-card/50">
              <CardTitle className="text-lg mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-primary mr-2" />
                Robustesse du boîtier
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Conçu pour les conditions africaines : résistant à la poussière, aux chocs et aux températures extrêmes.
                Garantie 3 ans.
              </CardDescription>
            </Card>

            <Card className="p-6 border-border bg-card/50">
              <CardTitle className="text-lg mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-primary mr-2" />
                Compatibilité véhicules
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Compatible avec tous les véhicules équipés d'un port OBD-II (2008+). Installation en 15 minutes, aucune
                modification du véhicule.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">ZoumAI</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Boîtier intelligent IoT qui sécurise les trajets et révolutionne la gestion des flottes en Afrique.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Sécurité Chauffeur
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Gestion Flotte
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Maintenance Prédictive
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Tableau de Bord
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Équipe
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Carrières
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Partenaires
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  contact@zoumai.com
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +229 XX XX XX XX
                </li>
                <li className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Cotonou, Bénin
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 ZoumAI. Tous droits réservés. | Mentions légales | Politique de confidentialité</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
