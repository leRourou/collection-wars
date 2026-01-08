import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/username
 * Récupère le username de l'utilisateur connecté
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });

    return NextResponse.json({ username: user?.username });
  } catch (error) {
    console.error("Error fetching username:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/user/username
 * Met à jour le username de l'utilisateur connecté
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { username } = body;

    // Validation du username
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Le pseudonyme est requis" },
        { status: 400 },
      );
    }

    const trimmedUsername = username.trim();

    // Vérifier les caractères autorisés (lettres, chiffres, - et _)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        {
          error:
            "Le pseudonyme ne peut contenir que des lettres, chiffres, - et _",
        },
        { status: 400 },
      );
    }

    if (trimmedUsername.length < 5 || trimmedUsername.length > 20) {
      return NextResponse.json(
        { error: "Le pseudonyme doit contenir entre 5 et 20 caractères" },
        { status: 400 },
      );
    }

    // Vérifier si le username est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "Ce pseudonyme est déjà utilisé" },
        { status: 409 },
      );
    }

    // Mettre à jour le username
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { username: trimmedUsername },
      select: { username: true },
    });

    return NextResponse.json({ username: updatedUser.username });
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
