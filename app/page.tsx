"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Users, AlertTriangle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function HomePage() {
  const { user, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (user) {
    if (user.role === "MANAGER") {
      return (
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue, {user.name}</h1>
                <p className="text-gray-600 mb-6">Accédez à votre tableau de bord manager</p>
                <Link href="/manager">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Accéder au Dashboard Manager
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DashboardLayout>
      )
    } else {
      return (
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue, {user.name}</h1>
                <p className="text-gray-600 mb-6">Accédez à votre tableau de bord conducteur</p>
                <Link href="/driver">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Accéder au Dashboard Conducteur
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DashboardLayout>
      )
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">ZoumAI Fleet Management</h1>
            <p className="text-xl text-gray-600 mb-8">Gestion intelligente de votre flotte de véhicules</p>
            <Link href="/auth/signin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Se connecter
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Truck className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <CardTitle>Gestion de Flotte</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Suivez et gérez tous vos véhicules en temps réel</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <CardTitle>Gestion Conducteurs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Organisez les équipes et assignez les missions</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                <CardTitle>Alertes Intelligentes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Recevez des notifications pour la maintenance et les incidents</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <CardTitle>Analyses & Rapports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Analysez les performances et optimisez les coûts</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
