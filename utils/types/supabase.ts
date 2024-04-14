export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chatparticipants: {
        Row: {
          chat_id: string;
          id: string;
          user_id: string;
        };
        Insert: {
          chat_id?: string;
          id?: string;
          user_id?: string;
        };
        Update: {
          chat_id?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_chatparticipants_chat_id_fkey";
            columns: ["chat_id"];
            isOneToOne: false;
            referencedRelation: "chats";
            referencedColumns: ["chat_id"];
          },
          {
            foreignKeyName: "public_chatparticipants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      chats: {
        Row: {
          chat_id: string;
          is_group: boolean;
        };
        Insert: {
          chat_id?: string;
          is_group?: boolean;
        };
        Update: {
          chat_id?: string;
          is_group?: boolean;
        };
        Relationships: [];
      };
      followers: {
        Row: {
          followed_id: string;
          follower_id: string;
        };
        Insert: {
          followed_id: string;
          follower_id?: string;
        };
        Update: {
          followed_id?: string;
          follower_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_followers_followed_id_fkey";
            columns: ["followed_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_followers_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          chat_id: string;
          content: string;
          image: string | null;
          message_id: string;
          reply_to: string | null;
          sender_id: string;
          sent_at: string;
        };
        Insert: {
          chat_id: string;
          content: string;
          image?: string | null;
          message_id?: string;
          reply_to?: string | null;
          sender_id: string;
          sent_at?: string;
        };
        Update: {
          chat_id?: string;
          content?: string;
          image?: string | null;
          message_id?: string;
          reply_to?: string | null;
          sender_id?: string;
          sent_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_messages_chat_id_fkey";
            columns: ["chat_id"];
            isOneToOne: false;
            referencedRelation: "chats";
            referencedColumns: ["chat_id"];
          },
          {
            foreignKeyName: "public_messages_reply_to_fkey";
            columns: ["reply_to"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["message_id"];
          },
          {
            foreignKeyName: "public_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          data: Json;
          id: string;
          read: boolean;
          recipient_id: string;
        };
        Insert: {
          created_at?: string;
          data: Json;
          id?: string;
          read?: boolean;
          recipient_id: string;
        };
        Update: {
          created_at?: string;
          data?: Json;
          id?: string;
          read?: boolean;
          recipient_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      postreplies: {
        Row: {
          id: string;
          post_id: string;
          reply_post_id: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          reply_post_id: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          reply_post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_postreplies_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_postreplies_reply_post_id_fkey";
            columns: ["reply_post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          author_id: string;
          created_at: string;
          embedding: number[];
          has_images: boolean;
          id: string;
          images: string[] | null;
          text: string;
        };
        Insert: {
          author_id?: string;
          created_at?: string;
          embedding: number[];
          has_images?: boolean;
          id?: string;
          images?: string[] | null;
          text: string;
        };
        Update: {
          author_id?: string;
          created_at?: string;
          embedding?: number[];
          has_images?: boolean;
          id?: string;
          images?: string[] | null;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      poststats: {
        Row: {
          bookmarks: number;
          id: string;
          likes: number;
          views: number;
        };
        Insert: {
          bookmarks?: number;
          id: string;
          likes?: number;
          views?: number;
        };
        Update: {
          bookmarks?: number;
          id?: string;
          likes?: number;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: "public_poststats_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          description: string | null;
          displayname: string | null;
          id: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          description?: string | null;
          displayname?: string | null;
          id: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          description?: string | null;
          displayname?: string | null;
          id?: string;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      saves: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_saves_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_saves_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_blocks: {
        Row: {
          blocked_user_id: string;
          user_id: string;
        };
        Insert: {
          blocked_user_id?: string;
          user_id?: string;
        };
        Update: {
          blocked_user_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_user_blocks_blocked_user_id_fkey";
            columns: ["blocked_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_user_blocks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_interactions: {
        Row: {
          post_embedding: string;
          post_id: string;
          user_id: string;
          weight: number;
        };
        Insert: {
          post_embedding: string;
          post_id?: string;
          user_id?: string;
          weight: number;
        };
        Update: {
          post_embedding?: string;
          post_id?: string;
          user_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "public_user_interactions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_user_interactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      views: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_views_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_views_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_new_post_scores: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      calculate_post_scores: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_all_posts: {
        Args: {
          page: number;
        };
        Returns: {
          id: string;
          text: string;
          created_at: string;
          has_images: boolean;
          images: string[];
          profiles: Json;
          reply_to: string;
          reply_count: number;
          has_liked: boolean;
          has_viewed: boolean;
          has_saved: boolean;
          likecount: number;
          viewcount: number;
          savecount: number;
        }[];
      };
      get_page_parents: {
        Args: {
          page_id: number;
        };
        Returns: {
          id: number;
          parent_page_id: number;
          path: string;
          meta: Json;
        }[];
      };
      get_posts_from_user: {
        Args: {
          id_of_user: string;
          page: number;
        };
        Returns: {
          id: string;
          text: string;
          created_at: string;
          has_images: boolean;
          images: string[];
          profiles: Json;
          reply_to: string;
          reply_count: number;
          has_liked: boolean;
          has_viewed: boolean;
          has_saved: boolean;
          likecount: number;
          viewcount: number;
          savecount: number;
        }[];
      };
      get_posts_with_interactions: {
        Args: Record<PropertyKey, never>;
        Returns: {
          post_id: string;
          interaction_type: string;
          post_text: string;
        }[];
      };
      get_profile_info: {
        Args: {
          username_param: string;
        };
        Returns: {
          id: string;
          displayname: string;
          description: string;
          avatar_url: string;
          has_followed: boolean;
          has_blocked: boolean;
          is_blocked: boolean;
          followers: number;
          following: number;
        }[];
      };
      get_replies_to_post: {
        Args: {
          id_of_post: string;
          page: number;
        };
        Returns: {
          id: string;
          text: string;
          created_at: string;
          has_images: boolean;
          images: string[];
          profiles: Json;
          reply_to: string;
          reply_count: number;
          has_liked: boolean;
          has_viewed: boolean;
          has_saved: boolean;
          likecount: number;
          viewcount: number;
          savecount: number;
        }[];
      };
      get_single_post_from_id: {
        Args: {
          id_of_post: string;
          page: number;
        };
        Returns: {
          id: string;
          text: string;
          created_at: string;
          has_images: boolean;
          images: string[];
          profiles: Json;
          reply_to: string;
          reply_count: number;
          has_liked: boolean;
          has_viewed: boolean;
          has_saved: boolean;
          likecount: number;
          viewcount: number;
          savecount: number;
        }[];
      };
      has_access_to_chat: {
        Args: {
          this_chat_id: string;
        };
        Returns: boolean;
      };
      hnswhandler: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      match_page_sections: {
        Args: {
          embedding: string;
          match_threshold: number;
          match_count: number;
          min_content_length: number;
        };
        Returns: {
          id: number;
          page_id: number;
          slug: string;
          heading: string;
          content: string;
          similarity: number;
        }[];
      };
      match_posts: {
        Args: {
          query_embedding: string;
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          text: string;
          created_at: string;
          has_images: boolean;
          images: string[];
          profiles: Json;
          reply_to: Json;
          replies: Json;
          userlike_count: Json;
          userview_count: Json;
          usersave_count: Json;
          likecount: Json;
          viewcount: Json;
          savecount: Json;
        }[];
      };
      match_posts_with_recommendations: {
        Args: {
          recommendation_index: number;
          page: number;
          match_threshold: number;
        };
        Returns: {
          id: string;
          text: string;
          created_at: string;
          has_images: boolean;
          images: string[];
          profiles: Json;
          reply_to: string;
          reply_count: number;
          has_liked: boolean;
          has_viewed: boolean;
          has_saved: boolean;
          likecount: number;
          viewcount: number;
          savecount: number;
        }[];
      };
      search_posts_by_text: {
        Args: {
          query: string;
          page: number;
        };
        Returns: {
          id: string;
          text: string;
          created_at: string;
          has_images: boolean;
          images: string[];
          profiles: Json;
          reply_to: string;
          reply_count: number;
          has_liked: boolean;
          has_viewed: boolean;
          has_saved: boolean;
          likecount: number;
          viewcount: number;
          savecount: number;
        }[];
      };
      search_users: {
        Args: {
          query: string;
          page: number;
        };
        Returns: {
          id: string;
          displayname: string;
          username: string;
          description: string;
          avatar_url: string;
          has_followed: boolean;
          has_blocked: boolean;
          is_blocked: boolean;
          followers: number;
          following: number;
          postcount: number;
        }[];
      };
      test_match_posts: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          text: string;
          created_at: string;
          has_images: boolean;
          images: string[];
          profiles: Json;
          reply_to: Json;
          replies: Json;
          userlike_count: Json;
          userview_count: Json;
          usersave_count: Json;
          likecount: Json;
          viewcount: Json;
          savecount: Json;
        }[];
      };
      test_search: {
        Args: {
          query: string;
          page: number;
        };
        Returns: {
          id: string;
          text: string;
          created_at: string;
          has_images: boolean;
          images: string[];
          profiles: Json;
          reply_to: string;
          reply_count: number;
          has_liked: boolean;
          has_viewed: boolean;
          has_saved: boolean;
          likecount: number;
          viewcount: number;
          savecount: number;
          score: number;
        }[];
      };
      vector_avg: {
        Args: {
          "": number[];
        };
        Returns: string;
      };
      vector_dims: {
        Args: {
          "": string;
        };
        Returns: number;
      };
      vector_norm: {
        Args: {
          "": string;
        };
        Returns: number;
      };
      vector_out: {
        Args: {
          "": string;
        };
        Returns: unknown;
      };
      vector_send: {
        Args: {
          "": string;
        };
        Returns: string;
      };
      vector_typmod_in: {
        Args: {
          "": unknown[];
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
