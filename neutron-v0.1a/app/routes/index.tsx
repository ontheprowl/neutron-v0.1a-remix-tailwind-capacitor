import { useLoaderData, useNavigate } from "@remix-run/react";
import { useForm } from "react-hook-form";
import Icon from "~/assets/images/iconFull.svg"
import { logout, requireUser } from "~/session.server";
import { redirect } from "@remix-run/server-runtime";
import { useEffect } from "react";

export async function loader({ request }: { request: Request }) {

  const session = await requireUser(request);


  if (session) {
    if (session?.metadata?.businessID) {
      return redirect(`/dashboard`)
    } else {
      return redirect(`/onboarding/integrations`)
    }

  }
  return redirect('/login')
}
