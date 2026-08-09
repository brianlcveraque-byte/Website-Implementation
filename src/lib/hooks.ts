"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AppUser, Client, Service } from "@/lib/database.types";

/** Small shared lookups used to populate <select> pickers across modules. */

export function useAppUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  useEffect(() => {
    supabase
      .from("app_users")
      .select("*")
      .eq("active", true)
      .order("full_name")
      .then(({ data }) => setUsers((data as AppUser[]) ?? []));
  }, []);
  return users;
}

export function useClientsLookup() {
  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => {
    supabase
      .from("clients")
      .select("*")
      .order("org_name")
      .then(({ data }) => setClients((data as Client[]) ?? []));
  }, []);
  return clients;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("category")
      .then(({ data }) => setServices((data as Service[]) ?? []));
  }, []);
  return services;
}
