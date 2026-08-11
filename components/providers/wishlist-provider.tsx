"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";

import { useSession } from "next-auth/react";

import type { Product } from "@/types";

type WishlistState = {
  items: Product[];
};

type WishlistAction =
  | {
      type: "TOGGLE_ITEM";
      payload: Product;
    }
  | {
      type: "REMOVE_ITEM";
      payload: string;
    }
  | {
      type: "CLEAR_WISHLIST";
    }
  | {
      type: "HYDRATE_WISHLIST";
      payload: WishlistState;
    };

type WishlistContextValue = {
  state: WishlistState;
  dispatch: Dispatch<WishlistAction>;
};

const initialState: WishlistState = {
  items: [],
};

const WISHLIST_STORAGE_KEY = "prostore-wishlist";

function wishlistReducer(
  state: WishlistState,
  action: WishlistAction,
): WishlistState {
  switch (action.type) {
    case "HYDRATE_WISHLIST":
      return action.payload;

    case "TOGGLE_ITEM": {
      const exists = state.items.some((item) => item.id === action.payload.id);

      if (exists) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "CLEAR_WISHLIST":
      return initialState;

    default:
      return state;
  }
}

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

type WishlistProviderProps = {
  children: ReactNode;
};

export function WishlistProvider({ children }: WishlistProviderProps) {
  const { data: session, status } = useSession();

  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  const hasHydratedRef = useRef(false);
  const databaseLoadedRef = useRef(false);
  const previousIdsRef = useRef<string[]>([]);
  const currentItemsRef = useRef<Product[]>([]);

  // Restore wishlist from localStorage.
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);

      if (storedWishlist) {
        const parsedWishlist = JSON.parse(storedWishlist) as WishlistState;

        dispatch({
          type: "HYDRATE_WISHLIST",
          payload: parsedWishlist,
        });
      }
    } catch {
      // Ignore invalid or corrupted wishlist data.
    } finally {
      hasHydratedRef.current = true;
    }
  }, []);

  // Save wishlist to localStorage.
  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    currentItemsRef.current = state.items;

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Load the authenticated user's database wishlist
  // and merge it with their local wishlist.
  useEffect(() => {
    if (status === "loading" || !hasHydratedRef.current) {
      return;
    }

    if (!session?.user?.id) {
      databaseLoadedRef.current = false;
      previousIdsRef.current = [];
      return;
    }

    if (databaseLoadedRef.current) {
      return;
    }

    async function loadDatabaseWishlist() {
      try {
        const response = await fetch("/api/wishlist", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load wishlist.");
        }

        const data = await response.json();

        const databaseItems = (data.items ?? []) as Product[];

        const localItems = currentItemsRef.current;

        const databaseIds = new Set(databaseItems.map((item) => item.id));

        const localOnlyItems = localItems.filter(
          (item) => !databaseIds.has(item.id),
        );

        const mergedItems = [...databaseItems, ...localOnlyItems];

        dispatch({
          type: "HYDRATE_WISHLIST",
          payload: {
            items: mergedItems,
          },
        });

        // Save local-only wishlist items to PostgreSQL.
        await Promise.all(
          localOnlyItems.map((item) =>
            fetch("/api/wishlist", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: item.id,
              }),
            }),
          ),
        );

        const mergedIds = mergedItems.map((item) => item.id);

        previousIdsRef.current = mergedIds;
        databaseLoadedRef.current = true;
      } catch (error) {
        console.error("Wishlist synchronization error:", error);
      }
    }

    loadDatabaseWishlist();
  }, [session?.user?.id, status]);

  // Synchronize wishlist changes made after the
  // database wishlist has been loaded.
  useEffect(() => {
    if (!session?.user?.id || !databaseLoadedRef.current) {
      return;
    }

    const currentIds = state.items.map((item) => item.id);

    const previousIds = previousIdsRef.current;

    const addedIds = currentIds.filter((id) => !previousIds.includes(id));

    const removedIds = previousIds.filter((id) => !currentIds.includes(id));

    if (addedIds.length > 0) {
      Promise.all(
        addedIds.map((productId) =>
          fetch("/api/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId,
            }),
          }),
        ),
      ).catch((error) => {
        console.error("Wishlist add synchronization error:", error);
      });
    }

    if (removedIds.length > 0) {
      Promise.all(
        removedIds.map((productId) =>
          fetch("/api/wishlist", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId,
            }),
          }),
        ),
      ).catch((error) => {
        console.error("Wishlist remove synchronization error:", error);
      });
    }

    previousIdsRef.current = currentIds;
  }, [state.items, session?.user?.id]);

  return (
    <WishlistContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}
