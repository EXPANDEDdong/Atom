"use server";

import { cookies } from "next/headers";
import { createClient } from "./supabase/actions";

const cookieStore = cookies();

const supabase = createClient(cookieStore);
