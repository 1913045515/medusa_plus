--
-- PostgreSQL database cluster dump
--

-- Started on 2026-04-06 23:39:43

\restrict 3QmvYN2zkSN5aw0hYzP303MWRtDYXFx7Ao4j00P5eTFp4CFlQUw6NZawYPkCxj4

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE medusa;
ALTER ROLE medusa WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;

--
-- User Configurations
--








\unrestrict 3QmvYN2zkSN5aw0hYzP303MWRtDYXFx7Ao4j00P5eTFp4CFlQUw6NZawYPkCxj4

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict XfACQzGftVenjfwwcHpPRc1VAPn5U5fTMWsFcwmhfvbu3GxcgwMrs9NLg0otPb1

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-06 23:39:46

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2026-04-06 23:40:06

--
-- PostgreSQL database dump complete
--

\unrestrict XfACQzGftVenjfwwcHpPRc1VAPn5U5fTMWsFcwmhfvbu3GxcgwMrs9NLg0otPb1

--
-- Database "medusa-my-store" dump
--

--
-- PostgreSQL database dump
--

\restrict J1ZpnzhnwkOUZFGbqHiQGJaja8WHPwIJqkv7r5ApGs0Kuloc3xMHuasVl6tzgwS

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-06 23:40:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5329 (class 1262 OID 16389)
-- Name: medusa-my-store; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "medusa-my-store" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE "medusa-my-store" OWNER TO postgres;

\unrestrict J1ZpnzhnwkOUZFGbqHiQGJaja8WHPwIJqkv7r5ApGs0Kuloc3xMHuasVl6tzgwS
\encoding SQL_ASCII
\connect -reuse-previous=on "dbname='medusa-my-store'"
\restrict J1ZpnzhnwkOUZFGbqHiQGJaja8WHPwIJqkv7r5ApGs0Kuloc3xMHuasVl6tzgwS

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 987 (class 1247 OID 16392)
-- Name: claim_reason_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.claim_reason_enum AS ENUM (
    'missing_item',
    'wrong_item',
    'production_failure',
    'other'
);


ALTER TYPE public.claim_reason_enum OWNER TO postgres;

--
-- TOC entry 990 (class 1247 OID 16402)
-- Name: order_claim_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_claim_type_enum AS ENUM (
    'refund',
    'replace'
);


ALTER TYPE public.order_claim_type_enum OWNER TO postgres;

--
-- TOC entry 993 (class 1247 OID 16408)
-- Name: order_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status_enum AS ENUM (
    'pending',
    'completed',
    'draft',
    'archived',
    'canceled',
    'requires_action'
);


ALTER TYPE public.order_status_enum OWNER TO postgres;

--
-- TOC entry 996 (class 1247 OID 16422)
-- Name: return_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.return_status_enum AS ENUM (
    'open',
    'requested',
    'received',
    'partially_received',
    'canceled'
);


ALTER TYPE public.return_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16433)
-- Name: account_holder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_holder (
    id text NOT NULL,
    provider_id text NOT NULL,
    external_id text NOT NULL,
    email text,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.account_holder OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16441)
-- Name: api_key; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_key (
    id text NOT NULL,
    token text NOT NULL,
    salt text NOT NULL,
    redacted text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    last_used_at timestamp with time zone,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_by text,
    revoked_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT api_key_type_check CHECK ((type = ANY (ARRAY['publishable'::text, 'secret'::text])))
);


ALTER TABLE public.api_key OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16449)
-- Name: application_method_buy_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_method_buy_rules (
    application_method_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


ALTER TABLE public.application_method_buy_rules OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16454)
-- Name: application_method_target_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_method_target_rules (
    application_method_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


ALTER TABLE public.application_method_target_rules OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16459)
-- Name: auth_identity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_identity (
    id text NOT NULL,
    app_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.auth_identity OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16466)
-- Name: capture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capture (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    payment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text,
    metadata jsonb
);


ALTER TABLE public.capture OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16473)
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    id text NOT NULL,
    region_id text,
    customer_id text,
    sales_channel_id text,
    email text,
    currency_code text NOT NULL,
    shipping_address_id text,
    billing_address_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    completed_at timestamp with time zone,
    locale text
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16480)
-- Name: cart_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_address (
    id text NOT NULL,
    customer_id text,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cart_address OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16487)
-- Name: cart_line_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_line_item (
    id text NOT NULL,
    cart_id text NOT NULL,
    title text NOT NULL,
    subtitle text,
    thumbnail text,
    quantity integer NOT NULL,
    variant_id text,
    product_id text,
    product_title text,
    product_description text,
    product_subtitle text,
    product_type text,
    product_collection text,
    product_handle text,
    variant_sku text,
    variant_barcode text,
    variant_title text,
    variant_option_values jsonb,
    requires_shipping boolean DEFAULT true NOT NULL,
    is_discountable boolean DEFAULT true NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb,
    unit_price numeric NOT NULL,
    raw_unit_price jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    product_type_id text,
    is_custom_price boolean DEFAULT false NOT NULL,
    is_giftcard boolean DEFAULT false NOT NULL,
    CONSTRAINT cart_line_item_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.cart_line_item OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16500)
-- Name: cart_line_item_adjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_line_item_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    item_id text,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    CONSTRAINT cart_line_item_adjustment_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.cart_line_item_adjustment OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16509)
-- Name: cart_line_item_tax_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_line_item_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate real NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    item_id text
);


ALTER TABLE public.cart_line_item_tax_line OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16516)
-- Name: cart_payment_collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_payment_collection (
    cart_id character varying(255) NOT NULL,
    payment_collection_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cart_payment_collection OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16523)
-- Name: cart_promotion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_promotion (
    cart_id character varying(255) NOT NULL,
    promotion_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cart_promotion OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16530)
-- Name: cart_shipping_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_shipping_method (
    id text NOT NULL,
    cart_id text NOT NULL,
    name text NOT NULL,
    description jsonb,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    shipping_option_id text,
    data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT cart_shipping_method_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.cart_shipping_method OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16539)
-- Name: cart_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_shipping_method_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    shipping_method_id text
);


ALTER TABLE public.cart_shipping_method_adjustment OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16546)
-- Name: cart_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_shipping_method_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate real NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    shipping_method_id text
);


ALTER TABLE public.cart_shipping_method_tax_line OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16553)
-- Name: course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course (
    id text NOT NULL,
    handle text NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    level text,
    lessons_count integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    product_id text,
    translations jsonb
);


ALTER TABLE public.course OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16562)
-- Name: course_purchase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_purchase (
    id text NOT NULL,
    customer_id text NOT NULL,
    course_id text NOT NULL,
    order_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.course_purchase OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16569)
-- Name: credit_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_line (
    id text NOT NULL,
    cart_id text NOT NULL,
    reference text,
    reference_id text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.credit_line OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16576)
-- Name: currency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currency (
    code text NOT NULL,
    symbol text NOT NULL,
    symbol_native text NOT NULL,
    decimal_digits integer DEFAULT 0 NOT NULL,
    rounding numeric DEFAULT 0 NOT NULL,
    raw_rounding jsonb NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.currency OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16585)
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id text NOT NULL,
    company_name text,
    first_name text,
    last_name text,
    email text,
    phone text,
    has_account boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16593)
-- Name: customer_account_holder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_account_holder (
    customer_id character varying(255) NOT NULL,
    account_holder_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_account_holder OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16600)
-- Name: customer_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_address (
    id text NOT NULL,
    customer_id text NOT NULL,
    address_name text,
    is_default_shipping boolean DEFAULT false NOT NULL,
    is_default_billing boolean DEFAULT false NOT NULL,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_address OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16609)
-- Name: customer_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_group (
    id text NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_group OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16616)
-- Name: customer_group_customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_group_customer (
    id text NOT NULL,
    customer_id text NOT NULL,
    customer_group_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_group_customer OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16623)
-- Name: fulfillment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment (
    id text NOT NULL,
    location_id text NOT NULL,
    packed_at timestamp with time zone,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    canceled_at timestamp with time zone,
    data jsonb,
    provider_id text,
    shipping_option_id text,
    metadata jsonb,
    delivery_address_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    marked_shipped_by text,
    created_by text,
    requires_shipping boolean DEFAULT true NOT NULL
);


ALTER TABLE public.fulfillment OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16631)
-- Name: fulfillment_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_address (
    id text NOT NULL,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_address OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16638)
-- Name: fulfillment_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_item (
    id text NOT NULL,
    title text NOT NULL,
    sku text NOT NULL,
    barcode text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    line_item_id text,
    inventory_item_id text,
    fulfillment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_item OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16645)
-- Name: fulfillment_label; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_label (
    id text NOT NULL,
    tracking_number text NOT NULL,
    tracking_url text NOT NULL,
    label_url text NOT NULL,
    fulfillment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_label OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16652)
-- Name: fulfillment_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_provider OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16660)
-- Name: fulfillment_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_set (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_set OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16667)
-- Name: geo_zone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.geo_zone (
    id text NOT NULL,
    type text DEFAULT 'country'::text NOT NULL,
    country_code text NOT NULL,
    province_code text,
    city text,
    service_zone_id text NOT NULL,
    postal_expression jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT geo_zone_type_check CHECK ((type = ANY (ARRAY['country'::text, 'province'::text, 'city'::text, 'zip'::text])))
);


ALTER TABLE public.geo_zone OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16676)
-- Name: homepage_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.homepage_content (
    id text NOT NULL,
    handle text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    content jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    title text NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    site_key text DEFAULT 'default'::text NOT NULL,
    translations jsonb
);


ALTER TABLE public.homepage_content OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16686)
-- Name: image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.image (
    id text NOT NULL,
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    rank integer DEFAULT 0 NOT NULL,
    product_id text NOT NULL
);


ALTER TABLE public.image OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16694)
-- Name: inventory_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    sku text,
    origin_country text,
    hs_code text,
    mid_code text,
    material text,
    weight integer,
    length integer,
    height integer,
    width integer,
    requires_shipping boolean DEFAULT true NOT NULL,
    description text,
    title text,
    thumbnail text,
    metadata jsonb
);


ALTER TABLE public.inventory_item OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 16702)
-- Name: inventory_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_level (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    inventory_item_id text NOT NULL,
    location_id text NOT NULL,
    stocked_quantity numeric DEFAULT 0 NOT NULL,
    reserved_quantity numeric DEFAULT 0 NOT NULL,
    incoming_quantity numeric DEFAULT 0 NOT NULL,
    metadata jsonb,
    raw_stocked_quantity jsonb,
    raw_reserved_quantity jsonb,
    raw_incoming_quantity jsonb
);


ALTER TABLE public.inventory_level OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16712)
-- Name: invite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invite (
    id text NOT NULL,
    email text NOT NULL,
    accepted boolean DEFAULT false NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.invite OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 16720)
-- Name: lesson; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson (
    id text NOT NULL,
    course_id text NOT NULL,
    title text NOT NULL,
    description text,
    episode_number integer NOT NULL,
    duration integer DEFAULT 0 NOT NULL,
    is_free boolean DEFAULT false NOT NULL,
    thumbnail_url text,
    video_url text,
    status text DEFAULT 'published'::text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    translations jsonb
);


ALTER TABLE public.lesson OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 16730)
-- Name: link_module_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.link_module_migrations (
    id integer NOT NULL,
    table_name character varying(255) NOT NULL,
    link_descriptor jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.link_module_migrations OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 16738)
-- Name: link_module_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.link_module_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.link_module_migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 254
-- Name: link_module_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.link_module_migrations_id_seq OWNED BY public.link_module_migrations.id;


--
-- TOC entry 255 (class 1259 OID 16739)
-- Name: location_fulfillment_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_fulfillment_provider (
    stock_location_id character varying(255) NOT NULL,
    fulfillment_provider_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.location_fulfillment_provider OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16746)
-- Name: location_fulfillment_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_fulfillment_set (
    stock_location_id character varying(255) NOT NULL,
    fulfillment_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.location_fulfillment_set OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 16753)
-- Name: mikro_orm_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mikro_orm_migrations (
    id integer NOT NULL,
    name character varying(255),
    executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mikro_orm_migrations OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 16757)
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mikro_orm_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mikro_orm_migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 258
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mikro_orm_migrations_id_seq OWNED BY public.mikro_orm_migrations.id;


--
-- TOC entry 259 (class 1259 OID 16758)
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id text NOT NULL,
    "to" text NOT NULL,
    channel text NOT NULL,
    template text,
    data jsonb,
    trigger_type text,
    resource_id text,
    resource_type text,
    receiver_id text,
    original_notification_id text,
    idempotency_key text,
    external_id text,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    "from" text,
    provider_data jsonb,
    CONSTRAINT notification_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failure'::text])))
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 16767)
-- Name: notification_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_provider (
    id text NOT NULL,
    handle text NOT NULL,
    name text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    channels text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.notification_provider OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 16776)
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id text NOT NULL,
    region_id text,
    display_id integer,
    customer_id text,
    version integer DEFAULT 1 NOT NULL,
    sales_channel_id text,
    status public.order_status_enum DEFAULT 'pending'::public.order_status_enum NOT NULL,
    is_draft_order boolean DEFAULT false NOT NULL,
    email text,
    currency_code text NOT NULL,
    shipping_address_id text,
    billing_address_id text,
    no_notification boolean,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    custom_display_id text,
    locale text
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 16786)
-- Name: order_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_address (
    id text NOT NULL,
    customer_id text,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_address OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 16793)
-- Name: order_cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_cart (
    order_id character varying(255) NOT NULL,
    cart_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_cart OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 16800)
-- Name: order_change; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_change (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    internal_note text,
    created_by text,
    requested_by text,
    requested_at timestamp with time zone,
    confirmed_by text,
    confirmed_at timestamp with time zone,
    declined_by text,
    declined_reason text,
    metadata jsonb,
    declined_at timestamp with time zone,
    canceled_by text,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    change_type text,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text,
    carry_over_promotions boolean,
    CONSTRAINT order_change_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'declined'::text, 'requested'::text, 'pending'::text, 'canceled'::text])))
);


ALTER TABLE public.order_change OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 16809)
-- Name: order_change_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_change_action (
    id text NOT NULL,
    order_id text,
    version integer,
    ordering bigint NOT NULL,
    order_change_id text,
    reference text,
    reference_id text,
    action text NOT NULL,
    details jsonb,
    amount numeric,
    raw_amount jsonb,
    internal_note text,
    applied boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


ALTER TABLE public.order_change_action OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 16817)
-- Name: order_change_action_ordering_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_change_action_ordering_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_change_action_ordering_seq OWNER TO postgres;

--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 266
-- Name: order_change_action_ordering_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_change_action_ordering_seq OWNED BY public.order_change_action.ordering;


--
-- TOC entry 267 (class 1259 OID 16818)
-- Name: order_claim; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_claim (
    id text NOT NULL,
    order_id text NOT NULL,
    return_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    type public.order_claim_type_enum NOT NULL,
    no_notification boolean,
    refund_amount numeric,
    raw_refund_amount jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.order_claim OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 16825)
-- Name: order_claim_display_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_claim_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_claim_display_id_seq OWNER TO postgres;

--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 268
-- Name: order_claim_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_claim_display_id_seq OWNED BY public.order_claim.display_id;


--
-- TOC entry 269 (class 1259 OID 16826)
-- Name: order_claim_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_claim_item (
    id text NOT NULL,
    claim_id text NOT NULL,
    item_id text NOT NULL,
    is_additional_item boolean DEFAULT false NOT NULL,
    reason public.claim_reason_enum,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_claim_item OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 16834)
-- Name: order_claim_item_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_claim_item_image (
    id text NOT NULL,
    claim_item_id text NOT NULL,
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_claim_item_image OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 16841)
-- Name: order_credit_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_credit_line (
    id text NOT NULL,
    order_id text NOT NULL,
    reference text,
    reference_id text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.order_credit_line OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 16849)
-- Name: order_display_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_display_id_seq OWNER TO postgres;

--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 272
-- Name: order_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_display_id_seq OWNED BY public."order".display_id;


--
-- TOC entry 273 (class 1259 OID 16850)
-- Name: order_exchange; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_exchange (
    id text NOT NULL,
    order_id text NOT NULL,
    return_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    no_notification boolean,
    allow_backorder boolean DEFAULT false NOT NULL,
    difference_due numeric,
    raw_difference_due jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.order_exchange OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 16858)
-- Name: order_exchange_display_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_exchange_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_exchange_display_id_seq OWNER TO postgres;

--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 274
-- Name: order_exchange_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_exchange_display_id_seq OWNED BY public.order_exchange.display_id;


--
-- TOC entry 275 (class 1259 OID 16859)
-- Name: order_exchange_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_exchange_item (
    id text NOT NULL,
    exchange_id text NOT NULL,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_exchange_item OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 16866)
-- Name: order_fulfillment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_fulfillment (
    order_id character varying(255) NOT NULL,
    fulfillment_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_fulfillment OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 16873)
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    fulfilled_quantity numeric NOT NULL,
    raw_fulfilled_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    shipped_quantity numeric NOT NULL,
    raw_shipped_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    return_requested_quantity numeric NOT NULL,
    raw_return_requested_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    return_received_quantity numeric NOT NULL,
    raw_return_received_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    return_dismissed_quantity numeric NOT NULL,
    raw_return_dismissed_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    written_off_quantity numeric NOT NULL,
    raw_written_off_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    delivered_quantity numeric DEFAULT 0 NOT NULL,
    raw_delivered_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    unit_price numeric,
    raw_unit_price jsonb,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 16888)
-- Name: order_line_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_line_item (
    id text NOT NULL,
    totals_id text,
    title text NOT NULL,
    subtitle text,
    thumbnail text,
    variant_id text,
    product_id text,
    product_title text,
    product_description text,
    product_subtitle text,
    product_type text,
    product_collection text,
    product_handle text,
    variant_sku text,
    variant_barcode text,
    variant_title text,
    variant_option_values jsonb,
    requires_shipping boolean DEFAULT true NOT NULL,
    is_discountable boolean DEFAULT true NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb,
    unit_price numeric NOT NULL,
    raw_unit_price jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_custom_price boolean DEFAULT false NOT NULL,
    product_type_id text,
    is_giftcard boolean DEFAULT false NOT NULL
);


ALTER TABLE public.order_line_item OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 16900)
-- Name: order_line_item_adjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_line_item_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    item_id text NOT NULL,
    deleted_at timestamp with time zone,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.order_line_item_adjustment OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 16909)
-- Name: order_line_item_tax_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_line_item_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate numeric NOT NULL,
    raw_rate jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    item_id text NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_line_item_tax_line OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 16916)
-- Name: order_payment_collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_payment_collection (
    order_id character varying(255) NOT NULL,
    payment_collection_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_payment_collection OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 16923)
-- Name: order_promotion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_promotion (
    order_id character varying(255) NOT NULL,
    promotion_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_promotion OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 16930)
-- Name: order_shipping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_shipping (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    shipping_method_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


ALTER TABLE public.order_shipping OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 16937)
-- Name: order_shipping_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_shipping_method (
    id text NOT NULL,
    name text NOT NULL,
    description jsonb,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    shipping_option_id text,
    data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_custom_amount boolean DEFAULT false NOT NULL
);


ALTER TABLE public.order_shipping_method OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 16946)
-- Name: order_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_shipping_method_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_method_id text NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_shipping_method_adjustment OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 16953)
-- Name: order_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_shipping_method_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate numeric NOT NULL,
    raw_rate jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_method_id text NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_shipping_method_tax_line OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 16960)
-- Name: order_summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_summary (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    totals jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_summary OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 16968)
-- Name: order_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_transaction (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    currency_code text NOT NULL,
    reference text,
    reference_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


ALTER TABLE public.order_transaction OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 16976)
-- Name: payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    currency_code text NOT NULL,
    provider_id text NOT NULL,
    data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    captured_at timestamp with time zone,
    canceled_at timestamp with time zone,
    payment_collection_id text NOT NULL,
    payment_session_id text NOT NULL,
    metadata jsonb
);


ALTER TABLE public.payment OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 16983)
-- Name: payment_collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_collection (
    id text NOT NULL,
    currency_code text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    authorized_amount numeric,
    raw_authorized_amount jsonb,
    captured_amount numeric,
    raw_captured_amount jsonb,
    refunded_amount numeric,
    raw_refunded_amount jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    completed_at timestamp with time zone,
    status text DEFAULT 'not_paid'::text NOT NULL,
    metadata jsonb,
    CONSTRAINT payment_collection_status_check CHECK ((status = ANY (ARRAY['not_paid'::text, 'awaiting'::text, 'authorized'::text, 'partially_authorized'::text, 'canceled'::text, 'failed'::text, 'partially_captured'::text, 'completed'::text])))
);


ALTER TABLE public.payment_collection OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 16992)
-- Name: payment_collection_payment_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_collection_payment_providers (
    payment_collection_id text NOT NULL,
    payment_provider_id text NOT NULL
);


ALTER TABLE public.payment_collection_payment_providers OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 16997)
-- Name: payment_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.payment_provider OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 17005)
-- Name: payment_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_session (
    id text NOT NULL,
    currency_code text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    context jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    authorized_at timestamp with time zone,
    payment_collection_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT payment_session_status_check CHECK ((status = ANY (ARRAY['authorized'::text, 'captured'::text, 'pending'::text, 'requires_more'::text, 'error'::text, 'canceled'::text])))
);


ALTER TABLE public.payment_session OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 17015)
-- Name: price; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price (
    id text NOT NULL,
    title text,
    price_set_id text NOT NULL,
    currency_code text NOT NULL,
    raw_amount jsonb NOT NULL,
    rules_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    price_list_id text,
    amount numeric NOT NULL,
    min_quantity numeric,
    max_quantity numeric,
    raw_min_quantity jsonb,
    raw_max_quantity jsonb
);


ALTER TABLE public.price OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 17023)
-- Name: price_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_list (
    id text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    rules_count integer DEFAULT 0,
    title text NOT NULL,
    description text NOT NULL,
    type text DEFAULT 'sale'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT price_list_status_check CHECK ((status = ANY (ARRAY['active'::text, 'draft'::text]))),
    CONSTRAINT price_list_type_check CHECK ((type = ANY (ARRAY['sale'::text, 'override'::text])))
);


ALTER TABLE public.price_list OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 17035)
-- Name: price_list_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_list_rule (
    id text NOT NULL,
    price_list_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    value jsonb,
    attribute text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.price_list_rule OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 17043)
-- Name: price_preference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_preference (
    id text NOT NULL,
    attribute text NOT NULL,
    value text,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.price_preference OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 17051)
-- Name: price_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_rule (
    id text NOT NULL,
    value text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    price_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    attribute text DEFAULT ''::text NOT NULL,
    operator text DEFAULT 'eq'::text NOT NULL,
    CONSTRAINT price_rule_operator_check CHECK ((operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text])))
);


ALTER TABLE public.price_rule OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 17062)
-- Name: price_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_set (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.price_set OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 17069)
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id text NOT NULL,
    title text NOT NULL,
    handle text NOT NULL,
    subtitle text,
    description text,
    is_giftcard boolean DEFAULT false NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    thumbnail text,
    weight text,
    length text,
    height text,
    width text,
    origin_country text,
    hs_code text,
    mid_code text,
    material text,
    collection_id text,
    type_id text,
    discountable boolean DEFAULT true NOT NULL,
    external_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    CONSTRAINT product_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'proposed'::text, 'published'::text, 'rejected'::text])))
);


ALTER TABLE public.product OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 17080)
-- Name: product_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_category (
    id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    handle text NOT NULL,
    mpath text NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    rank integer DEFAULT 0 NOT NULL,
    parent_category_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb
);


ALTER TABLE public.product_category OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 17091)
-- Name: product_category_product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_category_product (
    product_id text NOT NULL,
    product_category_id text NOT NULL
);


ALTER TABLE public.product_category_product OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 17096)
-- Name: product_collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_collection (
    id text NOT NULL,
    title text NOT NULL,
    handle text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_collection OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 17103)
-- Name: product_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_detail (
    id text NOT NULL,
    product_id text NOT NULL,
    long_desc_html text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_detail OWNER TO postgres;

--
-- TOC entry 305 (class 1259 OID 17110)
-- Name: product_image_meta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_image_meta (
    id text NOT NULL,
    product_id text NOT NULL,
    image_id text NOT NULL,
    is_main boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_image_meta OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 17119)
-- Name: product_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_option (
    id text NOT NULL,
    title text NOT NULL,
    product_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_option OWNER TO postgres;

--
-- TOC entry 307 (class 1259 OID 17126)
-- Name: product_option_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_option_value (
    id text NOT NULL,
    value text NOT NULL,
    option_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_option_value OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 17133)
-- Name: product_sales_channel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_sales_channel (
    product_id character varying(255) NOT NULL,
    sales_channel_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_sales_channel OWNER TO postgres;

--
-- TOC entry 309 (class 1259 OID 17140)
-- Name: product_shipping_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_shipping_profile (
    product_id character varying(255) NOT NULL,
    shipping_profile_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_shipping_profile OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 17147)
-- Name: product_tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_tag (
    id text NOT NULL,
    value text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_tag OWNER TO postgres;

--
-- TOC entry 311 (class 1259 OID 17154)
-- Name: product_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_tags (
    product_id text NOT NULL,
    product_tag_id text NOT NULL
);


ALTER TABLE public.product_tags OWNER TO postgres;

--
-- TOC entry 312 (class 1259 OID 17159)
-- Name: product_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_type (
    id text NOT NULL,
    value text NOT NULL,
    metadata json,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_type OWNER TO postgres;

--
-- TOC entry 313 (class 1259 OID 17166)
-- Name: product_variant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant (
    id text NOT NULL,
    title text NOT NULL,
    sku text,
    barcode text,
    ean text,
    upc text,
    allow_backorder boolean DEFAULT false NOT NULL,
    manage_inventory boolean DEFAULT true NOT NULL,
    hs_code text,
    origin_country text,
    mid_code text,
    material text,
    weight integer,
    length integer,
    height integer,
    width integer,
    metadata jsonb,
    variant_rank integer DEFAULT 0,
    product_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    thumbnail text
);


ALTER TABLE public.product_variant OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 17176)
-- Name: product_variant_inventory_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_inventory_item (
    variant_id character varying(255) NOT NULL,
    inventory_item_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    required_quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant_inventory_item OWNER TO postgres;

--
-- TOC entry 315 (class 1259 OID 17184)
-- Name: product_variant_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_option (
    variant_id text NOT NULL,
    option_value_id text NOT NULL
);


ALTER TABLE public.product_variant_option OWNER TO postgres;

--
-- TOC entry 316 (class 1259 OID 17189)
-- Name: product_variant_price_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_price_set (
    variant_id character varying(255) NOT NULL,
    price_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant_price_set OWNER TO postgres;

--
-- TOC entry 317 (class 1259 OID 17196)
-- Name: product_variant_product_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_product_image (
    id text NOT NULL,
    variant_id text NOT NULL,
    image_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant_product_image OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 17203)
-- Name: promotion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion (
    id text NOT NULL,
    code text NOT NULL,
    campaign_id text,
    is_automatic boolean DEFAULT false NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    "limit" integer,
    used integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    CONSTRAINT promotion_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'inactive'::text]))),
    CONSTRAINT promotion_type_check CHECK ((type = ANY (ARRAY['standard'::text, 'buyget'::text])))
);


ALTER TABLE public.promotion OWNER TO postgres;

--
-- TOC entry 319 (class 1259 OID 17216)
-- Name: promotion_application_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_application_method (
    id text NOT NULL,
    value numeric,
    raw_value jsonb,
    max_quantity integer,
    apply_to_quantity integer,
    buy_rules_min_quantity integer,
    type text NOT NULL,
    target_type text NOT NULL,
    allocation text,
    promotion_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    currency_code text,
    CONSTRAINT promotion_application_method_allocation_check CHECK ((allocation = ANY (ARRAY['each'::text, 'across'::text, 'once'::text]))),
    CONSTRAINT promotion_application_method_target_type_check CHECK ((target_type = ANY (ARRAY['order'::text, 'shipping_methods'::text, 'items'::text]))),
    CONSTRAINT promotion_application_method_type_check CHECK ((type = ANY (ARRAY['fixed'::text, 'percentage'::text])))
);


ALTER TABLE public.promotion_application_method OWNER TO postgres;

--
-- TOC entry 320 (class 1259 OID 17226)
-- Name: promotion_campaign; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_campaign (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    campaign_identifier text NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_campaign OWNER TO postgres;

--
-- TOC entry 321 (class 1259 OID 17233)
-- Name: promotion_campaign_budget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_campaign_budget (
    id text NOT NULL,
    type text NOT NULL,
    campaign_id text NOT NULL,
    "limit" numeric,
    raw_limit jsonb,
    used numeric DEFAULT 0 NOT NULL,
    raw_used jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    currency_code text,
    attribute text,
    CONSTRAINT promotion_campaign_budget_type_check CHECK ((type = ANY (ARRAY['spend'::text, 'usage'::text, 'use_by_attribute'::text, 'spend_by_attribute'::text])))
);


ALTER TABLE public.promotion_campaign_budget OWNER TO postgres;

--
-- TOC entry 322 (class 1259 OID 17242)
-- Name: promotion_campaign_budget_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_campaign_budget_usage (
    id text NOT NULL,
    attribute_value text NOT NULL,
    used numeric DEFAULT 0 NOT NULL,
    budget_id text NOT NULL,
    raw_used jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_campaign_budget_usage OWNER TO postgres;

--
-- TOC entry 323 (class 1259 OID 17250)
-- Name: promotion_promotion_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_promotion_rule (
    promotion_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


ALTER TABLE public.promotion_promotion_rule OWNER TO postgres;

--
-- TOC entry 324 (class 1259 OID 17255)
-- Name: promotion_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_rule (
    id text NOT NULL,
    description text,
    attribute text NOT NULL,
    operator text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT promotion_rule_operator_check CHECK ((operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text, 'ne'::text, 'in'::text])))
);


ALTER TABLE public.promotion_rule OWNER TO postgres;

--
-- TOC entry 325 (class 1259 OID 17263)
-- Name: promotion_rule_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_rule_value (
    id text NOT NULL,
    promotion_rule_id text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_rule_value OWNER TO postgres;

--
-- TOC entry 326 (class 1259 OID 17270)
-- Name: provider_identity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider_identity (
    id text NOT NULL,
    entity_id text NOT NULL,
    provider text NOT NULL,
    auth_identity_id text NOT NULL,
    user_metadata jsonb,
    provider_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.provider_identity OWNER TO postgres;

--
-- TOC entry 327 (class 1259 OID 17277)
-- Name: publishable_api_key_sales_channel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publishable_api_key_sales_channel (
    publishable_key_id character varying(255) NOT NULL,
    sales_channel_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.publishable_api_key_sales_channel OWNER TO postgres;

--
-- TOC entry 328 (class 1259 OID 17284)
-- Name: refund; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refund (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    payment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text,
    metadata jsonb,
    refund_reason_id text,
    note text
);


ALTER TABLE public.refund OWNER TO postgres;

--
-- TOC entry 329 (class 1259 OID 17291)
-- Name: refund_reason; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refund_reason (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    code text NOT NULL
);


ALTER TABLE public.refund_reason OWNER TO postgres;

--
-- TOC entry 330 (class 1259 OID 17298)
-- Name: region; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.region (
    id text NOT NULL,
    name text NOT NULL,
    currency_code text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    automatic_taxes boolean DEFAULT true NOT NULL
);


ALTER TABLE public.region OWNER TO postgres;

--
-- TOC entry 331 (class 1259 OID 17306)
-- Name: region_country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.region_country (
    iso_2 text NOT NULL,
    iso_3 text NOT NULL,
    num_code text NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    region_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.region_country OWNER TO postgres;

--
-- TOC entry 332 (class 1259 OID 17313)
-- Name: region_payment_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.region_payment_provider (
    region_id character varying(255) NOT NULL,
    payment_provider_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.region_payment_provider OWNER TO postgres;

--
-- TOC entry 333 (class 1259 OID 17320)
-- Name: reservation_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    line_item_id text,
    location_id text NOT NULL,
    quantity numeric NOT NULL,
    external_id text,
    description text,
    created_by text,
    metadata jsonb,
    inventory_item_id text NOT NULL,
    allow_backorder boolean DEFAULT false,
    raw_quantity jsonb
);


ALTER TABLE public.reservation_item OWNER TO postgres;

--
-- TOC entry 334 (class 1259 OID 17328)
-- Name: return; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return (
    id text NOT NULL,
    order_id text NOT NULL,
    claim_id text,
    exchange_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    status public.return_status_enum DEFAULT 'open'::public.return_status_enum NOT NULL,
    no_notification boolean,
    refund_amount numeric,
    raw_refund_amount jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    received_at timestamp with time zone,
    canceled_at timestamp with time zone,
    location_id text,
    requested_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.return OWNER TO postgres;

--
-- TOC entry 335 (class 1259 OID 17336)
-- Name: return_display_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.return_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.return_display_id_seq OWNER TO postgres;

--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 335
-- Name: return_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.return_display_id_seq OWNED BY public.return.display_id;


--
-- TOC entry 336 (class 1259 OID 17337)
-- Name: return_fulfillment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_fulfillment (
    return_id character varying(255) NOT NULL,
    fulfillment_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.return_fulfillment OWNER TO postgres;

--
-- TOC entry 337 (class 1259 OID 17344)
-- Name: return_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_item (
    id text NOT NULL,
    return_id text NOT NULL,
    reason_id text,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    received_quantity numeric DEFAULT 0 NOT NULL,
    raw_received_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    damaged_quantity numeric DEFAULT 0 NOT NULL,
    raw_damaged_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL
);


ALTER TABLE public.return_item OWNER TO postgres;

--
-- TOC entry 338 (class 1259 OID 17355)
-- Name: return_reason; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_reason (
    id character varying NOT NULL,
    value character varying NOT NULL,
    label character varying NOT NULL,
    description character varying,
    metadata jsonb,
    parent_return_reason_id character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.return_reason OWNER TO postgres;

--
-- TOC entry 339 (class 1259 OID 17362)
-- Name: sales_channel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_channel (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    is_disabled boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.sales_channel OWNER TO postgres;

--
-- TOC entry 340 (class 1259 OID 17370)
-- Name: sales_channel_stock_location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_channel_stock_location (
    sales_channel_id character varying(255) NOT NULL,
    stock_location_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.sales_channel_stock_location OWNER TO postgres;

--
-- TOC entry 341 (class 1259 OID 17377)
-- Name: script_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.script_migrations (
    id integer NOT NULL,
    script_name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    finished_at timestamp with time zone
);


ALTER TABLE public.script_migrations OWNER TO postgres;

--
-- TOC entry 342 (class 1259 OID 17381)
-- Name: script_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.script_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.script_migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 342
-- Name: script_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.script_migrations_id_seq OWNED BY public.script_migrations.id;


--
-- TOC entry 343 (class 1259 OID 17382)
-- Name: service_zone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_zone (
    id text NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    fulfillment_set_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.service_zone OWNER TO postgres;

--
-- TOC entry 344 (class 1259 OID 17389)
-- Name: shipping_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_option (
    id text NOT NULL,
    name text NOT NULL,
    price_type text DEFAULT 'flat'::text NOT NULL,
    service_zone_id text NOT NULL,
    shipping_profile_id text,
    provider_id text,
    data jsonb,
    metadata jsonb,
    shipping_option_type_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT shipping_option_price_type_check CHECK ((price_type = ANY (ARRAY['calculated'::text, 'flat'::text])))
);


ALTER TABLE public.shipping_option OWNER TO postgres;

--
-- TOC entry 345 (class 1259 OID 17398)
-- Name: shipping_option_price_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_option_price_set (
    shipping_option_id character varying(255) NOT NULL,
    price_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shipping_option_price_set OWNER TO postgres;

--
-- TOC entry 346 (class 1259 OID 17405)
-- Name: shipping_option_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_option_rule (
    id text NOT NULL,
    attribute text NOT NULL,
    operator text NOT NULL,
    value jsonb,
    shipping_option_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT shipping_option_rule_operator_check CHECK ((operator = ANY (ARRAY['in'::text, 'eq'::text, 'ne'::text, 'gt'::text, 'gte'::text, 'lt'::text, 'lte'::text, 'nin'::text])))
);


ALTER TABLE public.shipping_option_rule OWNER TO postgres;

--
-- TOC entry 347 (class 1259 OID 17413)
-- Name: shipping_option_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_option_type (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shipping_option_type OWNER TO postgres;

--
-- TOC entry 348 (class 1259 OID 17420)
-- Name: shipping_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_profile (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shipping_profile OWNER TO postgres;

--
-- TOC entry 349 (class 1259 OID 17427)
-- Name: stock_location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_location (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name text NOT NULL,
    address_id text,
    metadata jsonb
);


ALTER TABLE public.stock_location OWNER TO postgres;

--
-- TOC entry 350 (class 1259 OID 17434)
-- Name: stock_location_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_location_address (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    address_1 text NOT NULL,
    address_2 text,
    company text,
    city text,
    country_code text NOT NULL,
    phone text,
    province text,
    postal_code text,
    metadata jsonb
);


ALTER TABLE public.stock_location_address OWNER TO postgres;

--
-- TOC entry 351 (class 1259 OID 17441)
-- Name: store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store (
    id text NOT NULL,
    name text DEFAULT 'Medusa Store'::text NOT NULL,
    default_sales_channel_id text,
    default_region_id text,
    default_location_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.store OWNER TO postgres;

--
-- TOC entry 352 (class 1259 OID 17449)
-- Name: store_currency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_currency (
    id text NOT NULL,
    currency_code text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    store_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.store_currency OWNER TO postgres;

--
-- TOC entry 353 (class 1259 OID 17457)
-- Name: store_locale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_locale (
    id text NOT NULL,
    locale_code text NOT NULL,
    store_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.store_locale OWNER TO postgres;

--
-- TOC entry 354 (class 1259 OID 17464)
-- Name: tax_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tax_provider OWNER TO postgres;

--
-- TOC entry 355 (class 1259 OID 17472)
-- Name: tax_rate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_rate (
    id text NOT NULL,
    rate real,
    code text NOT NULL,
    name text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_combinable boolean DEFAULT false NOT NULL,
    tax_region_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tax_rate OWNER TO postgres;

--
-- TOC entry 356 (class 1259 OID 17481)
-- Name: tax_rate_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_rate_rule (
    id text NOT NULL,
    tax_rate_id text NOT NULL,
    reference_id text NOT NULL,
    reference text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tax_rate_rule OWNER TO postgres;

--
-- TOC entry 357 (class 1259 OID 17488)
-- Name: tax_region; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_region (
    id text NOT NULL,
    provider_id text,
    country_code text NOT NULL,
    province_code text,
    parent_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone,
    CONSTRAINT "CK_tax_region_country_top_level" CHECK (((parent_id IS NULL) OR (province_code IS NOT NULL))),
    CONSTRAINT "CK_tax_region_provider_top_level" CHECK (((parent_id IS NULL) OR (provider_id IS NULL)))
);


ALTER TABLE public.tax_region OWNER TO postgres;

--
-- TOC entry 358 (class 1259 OID 17497)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    first_name text,
    last_name text,
    email text NOT NULL,
    avatar_url text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 359 (class 1259 OID 17504)
-- Name: user_preference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preference (
    id text NOT NULL,
    user_id text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_preference OWNER TO postgres;

--
-- TOC entry 360 (class 1259 OID 17511)
-- Name: user_rbac_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_rbac_role (
    user_id character varying(255) NOT NULL,
    rbac_role_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_rbac_role OWNER TO postgres;

--
-- TOC entry 361 (class 1259 OID 17518)
-- Name: view_configuration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.view_configuration (
    id text NOT NULL,
    entity text NOT NULL,
    name text,
    user_id text,
    is_system_default boolean DEFAULT false NOT NULL,
    configuration jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.view_configuration OWNER TO postgres;

--
-- TOC entry 362 (class 1259 OID 17526)
-- Name: workflow_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_execution (
    id character varying NOT NULL,
    workflow_id character varying NOT NULL,
    transaction_id character varying NOT NULL,
    execution jsonb,
    context jsonb,
    state character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    retention_time integer,
    run_id text DEFAULT '01KKS0MSJQMXTCY0Y4TZQDT0RC'::text NOT NULL
);


ALTER TABLE public.workflow_execution OWNER TO postgres;

--
-- TOC entry 3941 (class 2604 OID 17534)
-- Name: link_module_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link_module_migrations ALTER COLUMN id SET DEFAULT nextval('public.link_module_migrations_id_seq'::regclass);


--
-- TOC entry 3948 (class 2604 OID 17535)
-- Name: mikro_orm_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mikro_orm_migrations ALTER COLUMN id SET DEFAULT nextval('public.mikro_orm_migrations_id_seq'::regclass);


--
-- TOC entry 3957 (class 2604 OID 17536)
-- Name: order display_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order" ALTER COLUMN display_id SET DEFAULT nextval('public.order_display_id_seq'::regclass);


--
-- TOC entry 3970 (class 2604 OID 17537)
-- Name: order_change_action ordering; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change_action ALTER COLUMN ordering SET DEFAULT nextval('public.order_change_action_ordering_seq'::regclass);


--
-- TOC entry 3974 (class 2604 OID 17538)
-- Name: order_claim display_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_claim ALTER COLUMN display_id SET DEFAULT nextval('public.order_claim_display_id_seq'::regclass);


--
-- TOC entry 3985 (class 2604 OID 17539)
-- Name: order_exchange display_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_exchange ALTER COLUMN display_id SET DEFAULT nextval('public.order_exchange_display_id_seq'::regclass);


--
-- TOC entry 4150 (class 2604 OID 17540)
-- Name: return display_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return ALTER COLUMN display_id SET DEFAULT nextval('public.return_display_id_seq'::regclass);


--
-- TOC entry 4169 (class 2604 OID 17541)
-- Name: script_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.script_migrations ALTER COLUMN id SET DEFAULT nextval('public.script_migrations_id_seq'::regclass);


--
-- TOC entry 5176 (class 0 OID 16433)
-- Dependencies: 215
-- Data for Name: account_holder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_holder (id, provider_id, external_id, email, data, metadata, created_at, updated_at, deleted_at) FROM stdin;
acchld_01KMAZM7VFVFWEHW7AZMKVXH0V	pp_system_default	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	208017534@qq.com	{}	\N	2026-03-22 14:36:46.832+00	2026-03-22 14:36:46.832+00	\N
\.


--
-- TOC entry 5177 (class 0 OID 16441)
-- Dependencies: 216
-- Data for Name: api_key; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_key (id, token, salt, redacted, title, type, last_used_at, created_by, created_at, revoked_by, revoked_at, updated_at, deleted_at) FROM stdin;
apk_01KKS0NJKVPKB85ZC6Z7SW53GP	pk_0ab9cc5b6f32fcfc17cb1c354d37062ccd7547b5332e9e54db2ce483eeee7ac2		pk_0ab***ac2	Default Publishable API Key	publishable	\N		2026-03-15 15:08:39.419+00	\N	\N	2026-03-15 15:08:39.419+00	\N
apk_01KNCDBP4F1CFAFK3PHX8VVGMF	pk_70387b7c6bffa7a79ce736561b41f13c5e6b04144a03701899f69390e495c98d		pk_703***98d	front-key	publishable	\N	user_01KKS0RH3WM7X6EFJVZF65TP4F	2026-04-04 14:11:42.863+00	\N	\N	2026-04-04 14:11:42.863+00	\N
apk_01KNCFXE0Y185NZV8NCRHPVDPG	8a85625e51c83ff4bd9aa5fd5b3ba7e32f7f7717e14b39f1dab28df832ba5808b8d1180cebf242a6545771f235a8015daaf70492c33b4abf5025b665975b0453	18ef81344dc183345ad4c0255719a356	sk_965***0cf	front-medusa-key	secret	\N	user_01KKS0RH3WM7X6EFJVZF65TP4F	2026-04-04 14:56:21.534+00	\N	\N	2026-04-04 14:56:21.534+00	\N
\.


--
-- TOC entry 5178 (class 0 OID 16449)
-- Dependencies: 217
-- Data for Name: application_method_buy_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_method_buy_rules (application_method_id, promotion_rule_id) FROM stdin;
\.


--
-- TOC entry 5179 (class 0 OID 16454)
-- Dependencies: 218
-- Data for Name: application_method_target_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_method_target_rules (application_method_id, promotion_rule_id) FROM stdin;
\.


--
-- TOC entry 5180 (class 0 OID 16459)
-- Dependencies: 219
-- Data for Name: auth_identity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_identity (id, app_metadata, created_at, updated_at, deleted_at) FROM stdin;
authid_01KKS0RH23SBDS07QSBWC9PXQ9	{"user_id": "user_01KKS0RH3WM7X6EFJVZF65TP4F"}	2026-03-15 15:10:16.131+00	2026-03-15 15:10:16.207+00	\N
authid_01KKVJHTNFT6EAFGBHA9VQZA7A	{"customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5"}	2026-03-16 14:59:39.823+00	2026-03-16 14:59:39.905+00	\N
\.


--
-- TOC entry 5181 (class 0 OID 16466)
-- Dependencies: 220
-- Data for Name: capture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.capture (id, amount, raw_amount, payment_id, created_at, updated_at, deleted_at, created_by, metadata) FROM stdin;
\.


--
-- TOC entry 5182 (class 0 OID 16473)
-- Dependencies: 221
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (id, region_id, customer_id, sales_channel_id, email, currency_code, shipping_address_id, billing_address_id, metadata, created_at, updated_at, deleted_at, completed_at, locale) FROM stdin;
cart_01KKVJGGX6SHHFABRKMF51398D	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	\N	\N	\N	2026-03-16 14:58:57.063+00	2026-03-16 14:59:40.089+00	\N	\N	\N
cart_01KKS1R0050PJXJ364HE75Y4CS	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	caaddr_01KMAZ2BCSG99YYW381QEZZ2XZ	caaddr_01KMAZ2BCS45BZD9DPHDTYV88H	\N	2026-03-15 15:27:27.239+00	2026-03-22 14:27:26.475+00	\N	2026-03-22 14:27:26.442+00	\N
cart_01KMAZK68JFQ2E21M85J9A5J15	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	caaddr_01KMAZKSEDG2AVW1RW65PR8MNG	caaddr_01KMAZKSEDTP1WXQPCAXT50CMY	\N	2026-03-22 14:36:12.436+00	2026-03-22 14:36:55.056+00	\N	2026-03-22 14:36:55.008+00	\N
cart_01KMB09VNMJS6MQ7BRN6FVPKF6	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	caaddr_01KMB0AMB5GVN1PDW8QBB7JF5T	caaddr_01KMB0AMB55RARRV1DWE8XM91M	\N	2026-03-22 14:48:35.255+00	2026-03-22 14:49:13.24+00	\N	2026-03-22 14:49:13.212+00	\N
cart_01KMDPRJQB7VK9882W9CSPS678	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	caaddr_01KMDPSBYD81R59C0S2XM7V5N2	caaddr_01KMDPSBYCPRFH7V4ZZJ03S19Q	\N	2026-03-23 15:59:35.149+00	2026-03-23 16:00:22.518+00	\N	2026-03-23 16:00:22.474+00	\N
cart_01KMR2XNBGXJPW3G3TF7GW9R96	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	caaddr_01KMR30X055T9TV82B69N0MF84	caaddr_01KMR30X05GTHD1CMJ31NPHGFP	\N	2026-03-27 16:44:28.915+00	2026-03-27 16:46:26.779+00	\N	2026-03-27 16:46:26.745+00	\N
cart_01KMWSQ4JZ55YT9T7ZGF1B8SJS	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	caaddr_01KMWT7K2WETJRHYM6SW2822MG	caaddr_01KMWT7K2V9PKHAKWWT8ZWC9J3	\N	2026-03-29 12:39:50.113+00	2026-03-29 12:48:59.591+00	\N	2026-03-29 12:48:59.549+00	\N
cart_01KMWVXRVNRVBCFJEPFX7HXE5C	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	caaddr_01KMWWKAP48K3FGY6FGGJSXE47	caaddr_01KMWWKAP4K5VE89MXH9A01G18	\N	2026-03-29 13:18:24.629+00	2026-03-29 13:30:22.953+00	\N	2026-03-29 13:30:22.92+00	\N
cart_01KMWWM82M78AESSN28SZJB2TN	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	\N	\N	\N	2026-03-29 13:30:41.109+00	2026-03-29 13:30:41.109+00	\N	\N	\N
cart_01KNEVD39HAY1ZCPQ4QNZ48EB4	reg_01KKS0NX3SA64NJ3XV501K8DX9	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	sc_01KKS0NJHVM2S73KTPZF792K8F	208017534@qq.com	eur	caaddr_01KNEVEV0VNK4M24ZJG51VP80K	caaddr_01KNEVEV0VD278W65ZW3SXWYFT	\N	2026-04-05 12:55:38.038+00	2026-04-05 12:56:44.89+00	\N	2026-04-05 12:56:44.842+00	\N
\.


--
-- TOC entry 5183 (class 0 OID 16480)
-- Dependencies: 222
-- Data for Name: cart_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_address (id, customer_id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
caaddr_01KMAZ2BCS45BZD9DPHDTYV88H	\N		11	111111	11		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:27:00.633+00	2026-03-22 14:27:00.633+00	\N
caaddr_01KMAZ2BCSG99YYW381QEZZ2XZ	\N		11	111111	11		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:27:00.633+00	2026-03-22 14:27:00.633+00	\N
caaddr_01KMAZKSEDTP1WXQPCAXT50CMY	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:36:32.077+00	2026-03-22 14:36:32.077+00	\N
caaddr_01KMAZKSEDG2AVW1RW65PR8MNG	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:36:32.078+00	2026-03-22 14:36:32.078+00	\N
caaddr_01KMB0AMB55RARRV1DWE8XM91M	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:49:00.518+00	2026-03-22 14:49:00.518+00	\N
caaddr_01KMB0AMB5GVN1PDW8QBB7JF5T	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:49:00.518+00	2026-03-22 14:49:00.518+00	\N
caaddr_01KMDPSBYCPRFH7V4ZZJ03S19Q	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-23 16:00:00.973+00	2026-03-23 16:00:00.973+00	\N
caaddr_01KMDPSBYD81R59C0S2XM7V5N2	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-23 16:00:00.973+00	2026-03-23 16:00:00.973+00	\N
caaddr_01KMR2XNBHRMGN71A1HYP9Z315	\N	\N	\N	\N	\N	\N	\N	us	\N	\N	\N	\N	2026-03-27 16:44:28.914+00	2026-03-27 16:44:28.914+00	\N
caaddr_01KMR2Y4ZSF635T8P83J4HHA62	\N		志强3	林6	福建省莆田市秀屿区东峤镇上塘村		莆田	us	福建	351100	15521509168	\N	2026-03-27 16:44:44.921+00	2026-03-27 16:44:44.921+00	\N
caaddr_01KMR2Y4ZSAD2V682Z7WY4FDPY	\N		志强3	林6	福建省莆田市秀屿区东峤镇上塘村		莆田	us	福建	351100	15521509168	\N	2026-03-27 16:44:44.921+00	2026-03-27 16:44:44.921+00	\N
caaddr_01KMR2ZKZP5XM27JKSV0A77VTN	\N		志强3	林6	福建省莆田市秀屿区东峤镇上塘村		莆田	us	福建	351100	15521509168	\N	2026-03-27 16:45:33.046+00	2026-03-27 16:45:33.046+00	\N
caaddr_01KMR2ZKZP2NS690H726TNMZXN	\N		志强3	林6	福建省莆田市秀屿区东峤镇上塘村		莆田	us	福建	351100	15521509168	\N	2026-03-27 16:45:33.046+00	2026-03-27 16:45:33.046+00	\N
caaddr_01KMR30X05GTHD1CMJ31NPHGFP	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-27 16:46:15.045+00	2026-03-27 16:46:15.045+00	\N
caaddr_01KMR30X055T9TV82B69N0MF84	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-27 16:46:15.045+00	2026-03-27 16:46:15.045+00	\N
caaddr_01KMWT7K2V9PKHAKWWT8ZWC9J3	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-29 12:48:49.244+00	2026-03-29 12:48:49.244+00	\N
caaddr_01KMWT7K2WETJRHYM6SW2822MG	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-29 12:48:49.244+00	2026-03-29 12:48:49.244+00	\N
caaddr_01KMWWKAP4K5VE89MXH9A01G18	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-29 13:30:11.013+00	2026-03-29 13:30:11.013+00	\N
caaddr_01KMWWKAP48K3FGY6FGGJSXE47	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-29 13:30:11.013+00	2026-03-29 13:30:11.013+00	\N
caaddr_01KNEVD39M50BJY357T4FR0M3K	\N	\N	\N	\N	\N	\N	\N	us	\N	\N	\N	\N	2026-04-05 12:55:38.037+00	2026-04-05 12:55:38.037+00	\N
caaddr_01KNEVDDDY8E2F0K55X45MDV76	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	us	福建	351100	+8615521509168	\N	2026-04-05 12:55:48.415+00	2026-04-05 12:55:48.415+00	\N
caaddr_01KNEVDDDZJM4W0E95B6H1B10P	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	us	福建	351100	+8615521509168	\N	2026-04-05 12:55:48.415+00	2026-04-05 12:55:48.415+00	\N
caaddr_01KNEVEV0VD278W65ZW3SXWYFT	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	+8615521509168	\N	2026-04-05 12:56:35.099+00	2026-04-05 12:56:35.099+00	\N
caaddr_01KNEVEV0VNK4M24ZJG51VP80K	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	+8615521509168	\N	2026-04-05 12:56:35.099+00	2026-04-05 12:56:35.099+00	\N
\.


--
-- TOC entry 5184 (class 0 OID 16487)
-- Dependencies: 223
-- Data for Name: cart_line_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_line_item (id, cart_id, title, subtitle, thumbnail, quantity, variant_id, product_id, product_title, product_description, product_subtitle, product_type, product_collection, product_handle, variant_sku, variant_barcode, variant_title, variant_option_values, requires_shipping, is_discountable, is_tax_inclusive, compare_at_unit_price, raw_compare_at_unit_price, unit_price, raw_unit_price, metadata, created_at, updated_at, deleted_at, product_type_id, is_custom_price, is_giftcard) FROM stdin;
cali_01KKS1R0CC66MCRSBEWCDHPZ1Y	cart_01KKS1R0050PJXJ364HE75Y4CS	Medusa Sweatshirt	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	1	variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-15 15:27:27.628+00	2026-03-15 15:27:27.628+00	\N	\N	f	f
cali_01KKVJGHERR2GTCPMBT3G2BP3K	cart_01KKVJGGX6SHHFABRKMF51398D	Medusa Sweatshirt	S	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	1	variant_01KKS0NXJ3G9VBA54CADHC4PFY	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-S	\N	S	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-16 14:58:57.624+00	2026-03-16 14:58:57.624+00	\N	\N	f	f
cali_01KM5VEWEHNZQZPGDS8KCB4KHA	cart_01KKVJGGX6SHHFABRKMF51398D	Medusa Sweatshirt	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	1	variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-20 14:47:44.849+00	2026-03-20 14:47:44.849+00	\N	\N	f	f
cali_01KMAZ15TV2DSJ23JM4F9K691T	cart_01KKS1R0050PJXJ364HE75Y4CS	Medusa T-Shirt	L / Black	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png	1	variant_01KKS0NXJ1BMX9E4QRGE1S4RTA	prod_01KKS0NXERW0SFT7YBHB0PQDC4	Medusa T-Shirt	Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.	\N	\N	\N	t-shirt	SHIRT-L-BLACK	\N	L / Black	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-22 14:26:22.172+00	2026-03-22 14:26:22.172+00	\N	\N	f	f
cali_01KMAZK6PPTFYBRNQ6J6VDNEZA	cart_01KMAZK68JFQ2E21M85J9A5J15	Medusa T-Shirt	L / Black	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png	1	variant_01KKS0NXJ1BMX9E4QRGE1S4RTA	prod_01KKS0NXERW0SFT7YBHB0PQDC4	Medusa T-Shirt	Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.	\N	\N	\N	t-shirt	SHIRT-L-BLACK	\N	L / Black	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-22 14:36:12.887+00	2026-03-22 14:36:12.887+00	\N	\N	f	f
cali_01KMB09W4NX7NHH6DV62HNVN65	cart_01KMB09VNMJS6MQ7BRN6FVPKF6	Medusa T-Shirt	M / Black	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png	1	variant_01KKS0NXJ1F47FMGMDEN317W58	prod_01KKS0NXERW0SFT7YBHB0PQDC4	Medusa T-Shirt	Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.	\N	\N	\N	t-shirt	SHIRT-M-BLACK	\N	M / Black	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-22 14:48:35.733+00	2026-03-22 14:48:35.733+00	\N	\N	f	f
cali_01KMDPRK79GRZ9T9B0MY8A8NMT	cart_01KMDPRJQB7VK9882W9CSPS678	Medusa Sweatshirt	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	1	variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-23 15:59:35.658+00	2026-03-23 15:59:35.658+00	\N	\N	f	f
cali_01KMR2XP0HTD8E0VPWP0ZHTP1G	cart_01KMR2XNBGXJPW3G3TF7GW9R96	Medusa Sweatshirt	M	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	1	variant_01KKS0NXJ3TDJEKQ0X293Y4TDA	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-M	\N	M	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-27 16:44:29.585+00	2026-03-27 16:45:55.92+00	\N	\N	f	f
cali_01KMWVXS3PEEMPTM5B0KP3YA4X	cart_01KMWVXRVNRVBCFJEPFX7HXE5C	Medusa Sweatshirt	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	8	variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:18:24.886+00	2026-03-29 13:26:42.932+00	\N	\N	f	f
cali_01KMWSQ4ZJNHER3RK94YVS3QAX	cart_01KMWSQ4JZ55YT9T7ZGF1B8SJS	Medusa Sweatshirt	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	8	variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 12:39:50.514+00	2026-03-29 12:48:32.545+00	\N	\N	f	f
cali_01KMWWEE3H8A2QCJ4TB3QTY3DH	cart_01KMWVXRVNRVBCFJEPFX7HXE5C	Medusa Sweatpants	XL	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	6	variant_01KKS0NXJ49QMTV0RV35JPNKJK	prod_01KKS0NXER6GCXWSYYHDT5E9TE	Medusa Sweatpants	<h1><strong>About this item</strong></h1><ul><li><p><span style="color: rgb(15, 17, 17);">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span></p></li><li><p><span style="color: rgb(15, 17, 17);">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color: rgb(15, 17, 17);">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	1111	\N	\N	sweatpants	SWEATPANTS-XL	\N	XL	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:27:30.673+00	2026-03-29 13:29:12.196+00	\N	\N	f	f
cali_01KMWWJ4JCY9PCMX6DBWCN5SFR	cart_01KMWVXRVNRVBCFJEPFX7HXE5C	Medusa Sweatpants	S	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	1	variant_01KKS0NXJ35DQKSZNNGW9DQPZR	prod_01KKS0NXER6GCXWSYYHDT5E9TE	Medusa Sweatpants	<h1><strong>About this item</strong></h1><ul><li><p><span style="color: rgb(15, 17, 17);">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span></p></li><li><p><span style="color: rgb(15, 17, 17);">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color: rgb(15, 17, 17);">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	1111	\N	\N	sweatpants	SWEATPANTS-S	\N	S	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:29:31.981+00	2026-03-29 13:29:31.981+00	\N	\N	f	f
cali_01KMWWJF08KK7W05MXK94AN1NJ	cart_01KMWVXRVNRVBCFJEPFX7HXE5C	Medusa Sweatpants	M	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	1	variant_01KKS0NXJ45CN25Z2Y5BH8R3Y1	prod_01KKS0NXER6GCXWSYYHDT5E9TE	Medusa Sweatpants	<h1><strong>About this item</strong></h1><ul><li><p><span style="color: rgb(15, 17, 17);">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span></p></li><li><p><span style="color: rgb(15, 17, 17);">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color: rgb(15, 17, 17);">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	1111	\N	\N	sweatpants	SWEATPANTS-M	\N	M	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:29:42.664+00	2026-03-29 13:29:42.664+00	\N	\N	f	f
cali_01KMWWNH8GBPRSD8FXAQCJGGH9	cart_01KMWWM82M78AESSN28SZJB2TN	Medusa Shorts	XL	https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png	1	variant_01KKS0NXJ5E05XKQHBBT8R9KXS	prod_01KKS0NXERTEZQTGVZJHWQQM2A	Medusa Shorts	Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.	\N	\N	\N	shorts	SHORTS-XL	\N	XL	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:31:23.28+00	2026-03-29 13:31:23.28+00	\N	\N	f	f
cali_01KMWWNWQM68Q0XXNN65H3NRRJ	cart_01KMWWM82M78AESSN28SZJB2TN	Medusa Shorts	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png	2	variant_01KKS0NXJ5GTP0HTQG6NJS71NZ	prod_01KKS0NXERTEZQTGVZJHWQQM2A	Medusa Shorts	Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.	\N	\N	\N	shorts	SHORTS-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:31:35.028+00	2026-03-29 13:48:09.237+00	\N	\N	f	f
cali_01KMWWM8908A4M79BAMXTAVZH2	cart_01KMWWM82M78AESSN28SZJB2TN	Medusa Shorts	M	https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png	6	variant_01KKS0NXJ5TXE692HKCMW8QCYR	prod_01KKS0NXERTEZQTGVZJHWQQM2A	Medusa Shorts	Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.	\N	\N	\N	shorts	SHORTS-M	\N	M	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:30:41.312+00	2026-03-29 13:46:59.614+00	\N	\N	f	f
cali_01KMWXJWJH82V8SK7SJYMX4RZG	cart_01KMWWM82M78AESSN28SZJB2TN	Medusa Sweatpants	M	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	1	variant_01KKS0NXJ45CN25Z2Y5BH8R3Y1	prod_01KKS0NXER6GCXWSYYHDT5E9TE	Medusa Sweatpants	<h1><strong>About this item</strong></h1><ul><li><p><span style="color: rgb(15, 17, 17);">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span></p></li><li><p><span style="color: rgb(15, 17, 17);">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color: rgb(15, 17, 17);">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	1111	\N	\N	sweatpants	SWEATPANTS-M	\N	M	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:47:25.138+00	2026-03-29 13:47:25.138+00	\N	\N	f	f
cali_01KMWWMZNYFQEGHAVXJE0S3JA7	cart_01KMWWM82M78AESSN28SZJB2TN	Medusa Shorts	S	https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png	7	variant_01KKS0NXJ468WFHB5JPG46TJHJ	prod_01KKS0NXERTEZQTGVZJHWQQM2A	Medusa Shorts	Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.	\N	\N	\N	shorts	SHORTS-S	\N	S	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:31:05.278+00	2026-03-29 13:53:21.136+00	\N	\N	f	f
cali_01KMWXY475VCN0FN64PXR8B3GH	cart_01KMWWM82M78AESSN28SZJB2TN	Medusa Sweatpants	S	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	1	variant_01KKS0NXJ35DQKSZNNGW9DQPZR	prod_01KKS0NXER6GCXWSYYHDT5E9TE	Medusa Sweatpants	<h1><strong>About this item</strong></h1><ul><li><p><span style="color: rgb(15, 17, 17);">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span></p></li><li><p><span style="color: rgb(15, 17, 17);">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color: rgb(15, 17, 17);">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	1111	\N	\N	sweatpants	SWEATPANTS-S	\N	S	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:53:33.415+00	2026-03-29 13:53:33.415+00	\N	\N	f	f
cali_01KMWYX9YMPEMWCNQA8S2T1JMF	cart_01KMWWM82M78AESSN28SZJB2TN	Medusa Sweatshirt	M	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	1	variant_01KKS0NXJ3TDJEKQ0X293Y4TDA	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-M	\N	M	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 14:10:35.092+00	2026-03-29 14:10:35.092+00	\N	\N	f	f
cali_01KNEVD3M87VDK8X5BQ1QESSMR	cart_01KNEVD39HAY1ZCPQ4QNZ48EB4	Medusa Sweatshirt	S	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	1	variant_01KKS0NXJ3G9VBA54CADHC4PFY	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-S	\N	S	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-04-05 12:55:38.376+00	2026-04-05 12:56:22.4+00	\N	\N	f	f
cali_01KNEVEEVEWASY7HVCH7VAYF65	cart_01KNEVD39HAY1ZCPQ4QNZ48EB4	Medusa Shorts	S	https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png	1	variant_01KKS0NXJ468WFHB5JPG46TJHJ	prod_01KKS0NXERTEZQTGVZJHWQQM2A	Medusa Shorts	Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.	\N	\N	\N	shorts	SHORTS-S	\N	S	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-04-05 12:56:22.639+00	2026-04-05 12:56:22.639+00	\N	\N	f	f
\.


--
-- TOC entry 5185 (class 0 OID 16500)
-- Dependencies: 224
-- Data for Name: cart_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_line_item_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, metadata, created_at, updated_at, deleted_at, item_id, is_tax_inclusive) FROM stdin;
\.


--
-- TOC entry 5186 (class 0 OID 16509)
-- Dependencies: 225
-- Data for Name: cart_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_line_item_tax_line (id, description, tax_rate_id, code, rate, provider_id, metadata, created_at, updated_at, deleted_at, item_id) FROM stdin;
\.


--
-- TOC entry 5187 (class 0 OID 16516)
-- Dependencies: 226
-- Data for Name: cart_payment_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_payment_collection (cart_id, payment_collection_id, id, created_at, updated_at, deleted_at) FROM stdin;
cart_01KKS1R0050PJXJ364HE75Y4CS	pay_col_01KMAZ2ZTSYMN61B0QXH7ZZY6Q	capaycol_01KMAZ2ZV7H3VFY5J9V1SG7JEM	2026-03-22 14:27:21.575167+00	2026-03-22 14:27:21.575167+00	\N
cart_01KMAZK68JFQ2E21M85J9A5J15	pay_col_01KMAZM7SETP0NZRCZN9BB8RTM	capaycol_01KMAZM7SSX5Y19EMG9BHR31BW	2026-03-22 14:36:46.776734+00	2026-03-22 14:36:46.776734+00	\N
cart_01KMB09VNMJS6MQ7BRN6FVPKF6	pay_col_01KMB0AVVC5RX6099VY08HBJNP	capaycol_01KMB0AVVR8M0HCTXP240KS69C	2026-03-22 14:49:08.215923+00	2026-03-22 14:49:08.215923+00	\N
cart_01KMDPRJQB7VK9882W9CSPS678	pay_col_01KMDPSW75Y3ZXZH7SVG1FZJ9S	capaycol_01KMDPSW7GDR8RRK1SM1RWDSZK	2026-03-23 16:00:17.648318+00	2026-03-23 16:00:17.648318+00	\N
cart_01KMR2XNBGXJPW3G3TF7GW9R96	pay_col_01KMR314RXMEDDRA79EKVW27MQ	capaycol_01KMR314S7PDE1RK31A8QFT3M1	2026-03-27 16:46:23.014971+00	2026-03-27 16:46:23.014971+00	\N
cart_01KMWSQ4JZ55YT9T7ZGF1B8SJS	pay_col_01KMWT7RPYTXTTGDR208M3K1YZ	capaycol_01KMWT7RQBN88H5GGVEQY82DDR	2026-03-29 12:48:55.019307+00	2026-03-29 12:48:55.019307+00	\N
cart_01KMWVXRVNRVBCFJEPFX7HXE5C	pay_col_01KMWWKKKNCEVCT943959Q63R4	capaycol_01KMWWKKKZ5R0C7CTD694NPK88	2026-03-29 13:30:20.154725+00	2026-03-29 13:30:20.154725+00	\N
cart_01KNEVD39HAY1ZCPQ4QNZ48EB4	pay_col_01KNEVF2CB25F0V0R409SP04B8	capaycol_01KNEVF2CK0YJ14Z2TTJECYS55	2026-04-05 12:56:42.642759+00	2026-04-05 12:56:42.642759+00	\N
\.


--
-- TOC entry 5188 (class 0 OID 16523)
-- Dependencies: 227
-- Data for Name: cart_promotion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_promotion (cart_id, promotion_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5189 (class 0 OID 16530)
-- Dependencies: 228
-- Data for Name: cart_shipping_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_shipping_method (id, cart_id, name, description, amount, raw_amount, is_tax_inclusive, shipping_option_id, data, metadata, created_at, updated_at, deleted_at) FROM stdin;
casm_01KMAZ2KNYHE5K6P1R3GRSW9RA	cart_01KKS1R0050PJXJ364HE75Y4CS	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-22 14:27:09.118+00	2026-03-22 14:27:12.662+00	2026-03-22 14:27:12.661+00
casm_01KMAZ2RBAYCYABCNPNSZ4G1RW	cart_01KKS1R0050PJXJ364HE75Y4CS	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-22 14:27:13.898+00	2026-03-22 14:27:13.898+00	\N
casm_01KMAZ2Q4KDA76YJCGZ3HS4WA0	cart_01KKS1R0050PJXJ364HE75Y4CS	Express Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAJFQNH1M6SF2AKH2V	{}	\N	2026-03-22 14:27:12.66+00	2026-03-22 14:27:13.901+00	2026-03-22 14:27:13.901+00
casm_01KMAZM1G22N44QH4ENA33M2T4	cart_01KMAZK68JFQ2E21M85J9A5J15	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-22 14:36:40.322+00	2026-03-22 14:36:40.322+00	\N
casm_01KMB0ARCM8YSB3CW66JMZ2DNH	cart_01KMB09VNMJS6MQ7BRN6FVPKF6	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-22 14:49:04.66+00	2026-03-22 14:49:04.66+00	\N
casm_01KMDPSGH0QFDZYFBMEFNGEHKZ	cart_01KMDPRJQB7VK9882W9CSPS678	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-23 16:00:05.664+00	2026-03-23 16:00:05.664+00	\N
casm_01KMR310C5VCCWHA6R4WGAKPR2	cart_01KMR2XNBGXJPW3G3TF7GW9R96	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-27 16:46:18.501+00	2026-03-27 16:46:18.501+00	\N
casm_01KMWT7NCPWW7NYB0AQM01EDWS	cart_01KMWSQ4JZ55YT9T7ZGF1B8SJS	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-29 12:48:51.606+00	2026-03-29 12:48:51.606+00	\N
casm_01KMWWKD51GBTA78DM0EEJBB1P	cart_01KMWVXRVNRVBCFJEPFX7HXE5C	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-29 13:30:13.537+00	2026-03-29 13:30:13.537+00	\N
casm_01KNEVEXA56RZJXDT6M08874SK	cart_01KNEVD39HAY1ZCPQ4QNZ48EB4	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-04-05 12:56:37.445+00	2026-04-05 12:56:37.445+00	\N
\.


--
-- TOC entry 5190 (class 0 OID 16539)
-- Dependencies: 229
-- Data for Name: cart_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_shipping_method_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, metadata, created_at, updated_at, deleted_at, shipping_method_id) FROM stdin;
\.


--
-- TOC entry 5191 (class 0 OID 16546)
-- Dependencies: 230
-- Data for Name: cart_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_shipping_method_tax_line (id, description, tax_rate_id, code, rate, provider_id, metadata, created_at, updated_at, deleted_at, shipping_method_id) FROM stdin;
\.


--
-- TOC entry 5192 (class 0 OID 16553)
-- Dependencies: 231
-- Data for Name: course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course (id, handle, title, description, thumbnail_url, level, lessons_count, status, metadata, created_at, updated_at, deleted_at, product_id, translations) FROM stdin;
course_demo_1	t-shirt	React 从零到一-v2	系统学习 React 核心概念，包含 Hooks、状态管理与项目实战。v2	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course1.jpeg	advanced	4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:07:44.986+00	\N	prod_01KKS0NXERW0SFT7YBHB0PQDC4	\N
course-demo-3	sweatpants	测试课程3	测试	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course2.jpeg	intermediate	1	published	\N	2026-03-23 15:23:02.485+00	2026-04-05 14:09:54.008+00	\N	prod_01KKS0NXER6GCXWSYYHDT5E9TE	\N
course_demo_2	sweatshirt	Next.js 全栈开发	深入 Next.js App Router，Server Components 与全栈部署实战。	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course3.jpeg	intermediate	8	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:10:29.243+00	\N	\N	\N
\.


--
-- TOC entry 5193 (class 0 OID 16562)
-- Dependencies: 232
-- Data for Name: course_purchase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_purchase (id, customer_id, course_id, order_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
cp_1774190953482_39ek	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	course_demo_1	order_01KMB0B0MJH078AXV9JSYN46TC	{"product_id": "prod_01KKS0NXERW0SFT7YBHB0PQDC4"}	2026-03-22 14:49:13.482+00	2026-03-22 14:49:13.482+00	\N
cp_1774281622767_gbki	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	course_demo_2	order_01KMDPT0TBE3JY8Y27WNS1KTBK	{"product_id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB"}	2026-03-23 16:00:22.767+00	2026-03-23 16:00:22.767+00	\N
cp_1774791023210_d800	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	course-demo-3	order_01KMWWKP67JM2ENS5DERPXKPV6	{"product_id": "prod_01KKS0NXER6GCXWSYYHDT5E9TE"}	2026-03-29 13:30:23.21+00	2026-03-29 13:30:23.21+00	\N
\.


--
-- TOC entry 5194 (class 0 OID 16569)
-- Dependencies: 233
-- Data for Name: credit_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_line (id, cart_id, reference, reference_id, amount, raw_amount, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5195 (class 0 OID 16576)
-- Dependencies: 234
-- Data for Name: currency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.currency (code, symbol, symbol_native, decimal_digits, rounding, raw_rounding, name, created_at, updated_at, deleted_at) FROM stdin;
usd	$	$	2	0	{"value": "0", "precision": 20}	US Dollar	2026-03-15 15:08:24.888+00	2026-03-15 15:08:24.888+00	\N
cad	CA$	$	2	0	{"value": "0", "precision": 20}	Canadian Dollar	2026-03-15 15:08:24.889+00	2026-03-15 15:08:24.889+00	\N
eur	€	€	2	0	{"value": "0", "precision": 20}	Euro	2026-03-15 15:08:24.889+00	2026-03-15 15:08:24.889+00	\N
aed	AED	د.إ.‏	2	0	{"value": "0", "precision": 20}	United Arab Emirates Dirham	2026-03-15 15:08:24.889+00	2026-03-15 15:08:24.889+00	\N
afn	Af	؋	0	0	{"value": "0", "precision": 20}	Afghan Afghani	2026-03-15 15:08:24.889+00	2026-03-15 15:08:24.889+00	\N
all	ALL	Lek	0	0	{"value": "0", "precision": 20}	Albanian Lek	2026-03-15 15:08:24.889+00	2026-03-15 15:08:24.889+00	\N
amd	AMD	դր.	0	0	{"value": "0", "precision": 20}	Armenian Dram	2026-03-15 15:08:24.889+00	2026-03-15 15:08:24.889+00	\N
ars	AR$	$	2	0	{"value": "0", "precision": 20}	Argentine Peso	2026-03-15 15:08:24.889+00	2026-03-15 15:08:24.889+00	\N
aud	AU$	$	2	0	{"value": "0", "precision": 20}	Australian Dollar	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
azn	man.	ман.	2	0	{"value": "0", "precision": 20}	Azerbaijani Manat	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
bam	KM	KM	2	0	{"value": "0", "precision": 20}	Bosnia-Herzegovina Convertible Mark	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
bdt	Tk	৳	2	0	{"value": "0", "precision": 20}	Bangladeshi Taka	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
bgn	BGN	лв.	2	0	{"value": "0", "precision": 20}	Bulgarian Lev	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
bhd	BD	د.ب.‏	3	0	{"value": "0", "precision": 20}	Bahraini Dinar	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
bif	FBu	FBu	0	0	{"value": "0", "precision": 20}	Burundian Franc	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
bnd	BN$	$	2	0	{"value": "0", "precision": 20}	Brunei Dollar	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
bob	Bs	Bs	2	0	{"value": "0", "precision": 20}	Bolivian Boliviano	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
brl	R$	R$	2	0	{"value": "0", "precision": 20}	Brazilian Real	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
bwp	BWP	P	2	0	{"value": "0", "precision": 20}	Botswanan Pula	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
byn	Br	руб.	2	0	{"value": "0", "precision": 20}	Belarusian Ruble	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
bzd	BZ$	$	2	0	{"value": "0", "precision": 20}	Belize Dollar	2026-03-15 15:08:24.89+00	2026-03-15 15:08:24.89+00	\N
cdf	CDF	FrCD	2	0	{"value": "0", "precision": 20}	Congolese Franc	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
chf	CHF	CHF	2	0.05	{"value": "0.05", "precision": 20}	Swiss Franc	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
clp	CL$	$	0	0	{"value": "0", "precision": 20}	Chilean Peso	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
cny	CN¥	CN¥	2	0	{"value": "0", "precision": 20}	Chinese Yuan	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
cop	CO$	$	0	0	{"value": "0", "precision": 20}	Colombian Peso	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
crc	₡	₡	0	0	{"value": "0", "precision": 20}	Costa Rican Colón	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
cve	CV$	CV$	2	0	{"value": "0", "precision": 20}	Cape Verdean Escudo	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
czk	Kč	Kč	2	0	{"value": "0", "precision": 20}	Czech Republic Koruna	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
djf	Fdj	Fdj	0	0	{"value": "0", "precision": 20}	Djiboutian Franc	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
dkk	Dkr	kr	2	0	{"value": "0", "precision": 20}	Danish Krone	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
dop	RD$	RD$	2	0	{"value": "0", "precision": 20}	Dominican Peso	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
dzd	DA	د.ج.‏	2	0	{"value": "0", "precision": 20}	Algerian Dinar	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
eek	Ekr	kr	2	0	{"value": "0", "precision": 20}	Estonian Kroon	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
egp	EGP	ج.م.‏	2	0	{"value": "0", "precision": 20}	Egyptian Pound	2026-03-15 15:08:24.891+00	2026-03-15 15:08:24.891+00	\N
ern	Nfk	Nfk	2	0	{"value": "0", "precision": 20}	Eritrean Nakfa	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
etb	Br	Br	2	0	{"value": "0", "precision": 20}	Ethiopian Birr	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
gbp	£	£	2	0	{"value": "0", "precision": 20}	British Pound Sterling	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
gel	GEL	GEL	2	0	{"value": "0", "precision": 20}	Georgian Lari	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
ghs	GH₵	GH₵	2	0	{"value": "0", "precision": 20}	Ghanaian Cedi	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
gnf	FG	FG	0	0	{"value": "0", "precision": 20}	Guinean Franc	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
gtq	GTQ	Q	2	0	{"value": "0", "precision": 20}	Guatemalan Quetzal	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
hkd	HK$	$	2	0	{"value": "0", "precision": 20}	Hong Kong Dollar	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
hnl	HNL	L	2	0	{"value": "0", "precision": 20}	Honduran Lempira	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
hrk	kn	kn	2	0	{"value": "0", "precision": 20}	Croatian Kuna	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
huf	Ft	Ft	0	0	{"value": "0", "precision": 20}	Hungarian Forint	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
idr	Rp	Rp	0	0	{"value": "0", "precision": 20}	Indonesian Rupiah	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
ils	₪	₪	2	0	{"value": "0", "precision": 20}	Israeli New Sheqel	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
inr	Rs	₹	2	0	{"value": "0", "precision": 20}	Indian Rupee	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
iqd	IQD	د.ع.‏	0	0	{"value": "0", "precision": 20}	Iraqi Dinar	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
irr	IRR	﷼	0	0	{"value": "0", "precision": 20}	Iranian Rial	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
isk	Ikr	kr	0	0	{"value": "0", "precision": 20}	Icelandic Króna	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
jmd	J$	$	2	0	{"value": "0", "precision": 20}	Jamaican Dollar	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
jod	JD	د.أ.‏	3	0	{"value": "0", "precision": 20}	Jordanian Dinar	2026-03-15 15:08:24.892+00	2026-03-15 15:08:24.892+00	\N
jpy	¥	￥	0	0	{"value": "0", "precision": 20}	Japanese Yen	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
kes	Ksh	Ksh	2	0	{"value": "0", "precision": 20}	Kenyan Shilling	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
khr	KHR	៛	2	0	{"value": "0", "precision": 20}	Cambodian Riel	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
kmf	CF	FC	0	0	{"value": "0", "precision": 20}	Comorian Franc	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
krw	₩	₩	0	0	{"value": "0", "precision": 20}	South Korean Won	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
kwd	KD	د.ك.‏	3	0	{"value": "0", "precision": 20}	Kuwaiti Dinar	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
kzt	KZT	тңг.	2	0	{"value": "0", "precision": 20}	Kazakhstani Tenge	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
lbp	LB£	ل.ل.‏	0	0	{"value": "0", "precision": 20}	Lebanese Pound	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
lkr	SLRs	SL Re	2	0	{"value": "0", "precision": 20}	Sri Lankan Rupee	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
ltl	Lt	Lt	2	0	{"value": "0", "precision": 20}	Lithuanian Litas	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
lvl	Ls	Ls	2	0	{"value": "0", "precision": 20}	Latvian Lats	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
lyd	LD	د.ل.‏	3	0	{"value": "0", "precision": 20}	Libyan Dinar	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
mad	MAD	د.م.‏	2	0	{"value": "0", "precision": 20}	Moroccan Dirham	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
mdl	MDL	MDL	2	0	{"value": "0", "precision": 20}	Moldovan Leu	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
mga	MGA	MGA	0	0	{"value": "0", "precision": 20}	Malagasy Ariary	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
mkd	MKD	MKD	2	0	{"value": "0", "precision": 20}	Macedonian Denar	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
mmk	MMK	K	0	0	{"value": "0", "precision": 20}	Myanma Kyat	2026-03-15 15:08:24.893+00	2026-03-15 15:08:24.893+00	\N
mnt	MNT	₮	0	0	{"value": "0", "precision": 20}	Mongolian Tugrig	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
mop	MOP$	MOP$	2	0	{"value": "0", "precision": 20}	Macanese Pataca	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
mur	MURs	MURs	0	0	{"value": "0", "precision": 20}	Mauritian Rupee	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
mwk	K	K	2	0	{"value": "0", "precision": 20}	Malawian Kwacha	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
mxn	MX$	$	2	0	{"value": "0", "precision": 20}	Mexican Peso	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
myr	RM	RM	2	0	{"value": "0", "precision": 20}	Malaysian Ringgit	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
mzn	MTn	MTn	2	0	{"value": "0", "precision": 20}	Mozambican Metical	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
nad	N$	N$	2	0	{"value": "0", "precision": 20}	Namibian Dollar	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
ngn	₦	₦	2	0	{"value": "0", "precision": 20}	Nigerian Naira	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
nio	C$	C$	2	0	{"value": "0", "precision": 20}	Nicaraguan Córdoba	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
nok	Nkr	kr	2	0	{"value": "0", "precision": 20}	Norwegian Krone	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
npr	NPRs	नेरू	2	0	{"value": "0", "precision": 20}	Nepalese Rupee	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
nzd	NZ$	$	2	0	{"value": "0", "precision": 20}	New Zealand Dollar	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
omr	OMR	ر.ع.‏	3	0	{"value": "0", "precision": 20}	Omani Rial	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
pab	B/.	B/.	2	0	{"value": "0", "precision": 20}	Panamanian Balboa	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
pen	S/.	S/.	2	0	{"value": "0", "precision": 20}	Peruvian Nuevo Sol	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
php	₱	₱	2	0	{"value": "0", "precision": 20}	Philippine Peso	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
pkr	PKRs	₨	0	0	{"value": "0", "precision": 20}	Pakistani Rupee	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
pln	zł	zł	2	0	{"value": "0", "precision": 20}	Polish Zloty	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
pyg	₲	₲	0	0	{"value": "0", "precision": 20}	Paraguayan Guarani	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
qar	QR	ر.ق.‏	2	0	{"value": "0", "precision": 20}	Qatari Rial	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
ron	RON	RON	2	0	{"value": "0", "precision": 20}	Romanian Leu	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
rsd	din.	дин.	0	0	{"value": "0", "precision": 20}	Serbian Dinar	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
rub	RUB	₽.	2	0	{"value": "0", "precision": 20}	Russian Ruble	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
rwf	RWF	FR	0	0	{"value": "0", "precision": 20}	Rwandan Franc	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
sar	SR	ر.س.‏	2	0	{"value": "0", "precision": 20}	Saudi Riyal	2026-03-15 15:08:24.894+00	2026-03-15 15:08:24.894+00	\N
sdg	SDG	SDG	2	0	{"value": "0", "precision": 20}	Sudanese Pound	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
sek	Skr	kr	2	0	{"value": "0", "precision": 20}	Swedish Krona	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
sgd	S$	$	2	0	{"value": "0", "precision": 20}	Singapore Dollar	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
sos	Ssh	Ssh	0	0	{"value": "0", "precision": 20}	Somali Shilling	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
syp	SY£	ل.س.‏	0	0	{"value": "0", "precision": 20}	Syrian Pound	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
thb	฿	฿	2	0	{"value": "0", "precision": 20}	Thai Baht	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
tnd	DT	د.ت.‏	3	0	{"value": "0", "precision": 20}	Tunisian Dinar	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
top	T$	T$	2	0	{"value": "0", "precision": 20}	Tongan Paʻanga	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
tjs	TJS	с.	2	0	{"value": "0", "precision": 20}	Tajikistani Somoni	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
try	₺	₺	2	0	{"value": "0", "precision": 20}	Turkish Lira	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
ttd	TT$	$	2	0	{"value": "0", "precision": 20}	Trinidad and Tobago Dollar	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
twd	NT$	NT$	2	0	{"value": "0", "precision": 20}	New Taiwan Dollar	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
tzs	TSh	TSh	0	0	{"value": "0", "precision": 20}	Tanzanian Shilling	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
uah	₴	₴	2	0	{"value": "0", "precision": 20}	Ukrainian Hryvnia	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
ugx	USh	USh	0	0	{"value": "0", "precision": 20}	Ugandan Shilling	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
uyu	$U	$	2	0	{"value": "0", "precision": 20}	Uruguayan Peso	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
uzs	UZS	UZS	0	0	{"value": "0", "precision": 20}	Uzbekistan Som	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
vef	Bs.F.	Bs.F.	2	0	{"value": "0", "precision": 20}	Venezuelan Bolívar	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
vnd	₫	₫	0	0	{"value": "0", "precision": 20}	Vietnamese Dong	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
xaf	FCFA	FCFA	0	0	{"value": "0", "precision": 20}	CFA Franc BEAC	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
xof	CFA	CFA	0	0	{"value": "0", "precision": 20}	CFA Franc BCEAO	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
xpf	₣	₣	0	0	{"value": "0", "precision": 20}	CFP Franc	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
yer	YR	ر.ي.‏	0	0	{"value": "0", "precision": 20}	Yemeni Rial	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
zar	R	R	2	0	{"value": "0", "precision": 20}	South African Rand	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
zmk	ZK	ZK	0	0	{"value": "0", "precision": 20}	Zambian Kwacha	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
zwl	ZWL$	ZWL$	0	0	{"value": "0", "precision": 20}	Zimbabwean Dollar	2026-03-15 15:08:24.895+00	2026-03-15 15:08:24.895+00	\N
\.


--
-- TOC entry 5196 (class 0 OID 16585)
-- Dependencies: 235
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer (id, company_name, first_name, last_name, email, phone, has_account, metadata, created_at, updated_at, deleted_at, created_by) FROM stdin;
cus_01KKVJHTQJ8HRQQ7JF1327DRG5	\N	lin	zhiqiang	208017534@qq.com	15521509168	t	\N	2026-03-16 14:59:39.89+00	2026-03-16 14:59:39.89+00	\N	\N
\.


--
-- TOC entry 5197 (class 0 OID 16593)
-- Dependencies: 236
-- Data for Name: customer_account_holder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_account_holder (customer_id, account_holder_id, id, created_at, updated_at, deleted_at) FROM stdin;
cus_01KKVJHTQJ8HRQQ7JF1327DRG5	acchld_01KMAZM7VFVFWEHW7AZMKVXH0V	custacchldr_01KMAZM7VVKPKKVHTXMYGG1DWY	2026-03-22 14:36:46.843911+00	2026-03-22 14:36:46.843911+00	\N
\.


--
-- TOC entry 5198 (class 0 OID 16600)
-- Dependencies: 237
-- Data for Name: customer_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_address (id, customer_id, address_name, is_default_shipping, is_default_billing, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
cuaddr_01KMR216BX3SR220GBXYXPSFJ3	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	\N	f	f		志强3	林6	福建省莆田市秀屿区东峤镇上塘村		莆田	us	福建	351100	15521509168	\N	2026-03-27 16:28:56.065+00	2026-03-27 16:43:50.736+00	\N
cuaddr_01KMR2WPG233CNE36V0TEY2T2M	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	\N	f	f		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	us	福建	351100	15521509168	\N	2026-03-27 16:43:57.314+00	2026-03-27 16:43:57.314+00	\N
\.


--
-- TOC entry 5199 (class 0 OID 16609)
-- Dependencies: 238
-- Data for Name: customer_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_group (id, name, metadata, created_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5200 (class 0 OID 16616)
-- Dependencies: 239
-- Data for Name: customer_group_customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_group_customer (id, customer_id, customer_group_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- TOC entry 5201 (class 0 OID 16623)
-- Dependencies: 240
-- Data for Name: fulfillment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment (id, location_id, packed_at, shipped_at, delivered_at, canceled_at, data, provider_id, shipping_option_id, metadata, delivery_address_id, created_at, updated_at, deleted_at, marked_shipped_by, created_by, requires_shipping) FROM stdin;
\.


--
-- TOC entry 5202 (class 0 OID 16631)
-- Dependencies: 241
-- Data for Name: fulfillment_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_address (id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5203 (class 0 OID 16638)
-- Dependencies: 242
-- Data for Name: fulfillment_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_item (id, title, sku, barcode, quantity, raw_quantity, line_item_id, inventory_item_id, fulfillment_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5204 (class 0 OID 16645)
-- Dependencies: 243
-- Data for Name: fulfillment_label; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_label (id, tracking_number, tracking_url, label_url, fulfillment_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5205 (class 0 OID 16652)
-- Dependencies: 244
-- Data for Name: fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
manual_manual	t	2026-03-15 15:08:24.957+00	2026-03-15 15:08:24.957+00	\N
\.


--
-- TOC entry 5206 (class 0 OID 16660)
-- Dependencies: 245
-- Data for Name: fulfillment_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_set (id, name, type, metadata, created_at, updated_at, deleted_at) FROM stdin;
fuset_01KKS0NX7TQC2MQRKB74P3VNNP	European Warehouse delivery	shipping	\N	2026-03-15 15:08:50.298+00	2026-03-15 15:08:50.298+00	\N
\.


--
-- TOC entry 5207 (class 0 OID 16667)
-- Dependencies: 246
-- Data for Name: geo_zone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.geo_zone (id, type, country_code, province_code, city, service_zone_id, postal_expression, metadata, created_at, updated_at, deleted_at) FROM stdin;
fgz_01KKS0NX7SPMTJNXSBNJ7B5VFD	country	gb	\N	\N	serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	\N	\N	2026-03-15 15:08:50.299+00	2026-03-15 15:08:50.299+00	\N
fgz_01KKS0NX7SM6K0S7Q0FAC9B10R	country	de	\N	\N	serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	\N	\N	2026-03-15 15:08:50.299+00	2026-03-15 15:08:50.299+00	\N
fgz_01KKS0NX7S18H1G8CSZHKQVHPP	country	dk	\N	\N	serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	\N	\N	2026-03-15 15:08:50.299+00	2026-03-15 15:08:50.299+00	\N
fgz_01KKS0NX7TVK42X5K9J0X4G5C1	country	se	\N	\N	serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	\N	\N	2026-03-15 15:08:50.299+00	2026-03-15 15:08:50.299+00	\N
fgz_01KKS0NX7T0R8SKWDR9XAK3C0Z	country	fr	\N	\N	serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	\N	\N	2026-03-15 15:08:50.299+00	2026-03-15 15:08:50.299+00	\N
fgz_01KKS0NX7T9ZGP0ZPSNX17K51J	country	es	\N	\N	serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	\N	\N	2026-03-15 15:08:50.299+00	2026-03-15 15:08:50.299+00	\N
fgz_01KKS0NX7TH39MF7SYTEQHE4QW	country	it	\N	\N	serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	\N	\N	2026-03-15 15:08:50.299+00	2026-03-15 15:08:50.299+00	\N
\.


--
-- TOC entry 5208 (class 0 OID 16676)
-- Dependencies: 247
-- Data for Name: homepage_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.homepage_content (id, handle, status, content, metadata, created_at, updated_at, deleted_at, title, is_active, published_at, site_key, translations) FROM stdin;
homepage_default_main	main	draft	{"template": {"css": "", "html": "111"}, "render_mode": "static_html"}	\N	2026-03-26 14:52:56.736869+00	2026-03-28 15:36:30.111+00	\N	Default Homepage	f	2026-03-27 16:04:28.097+00	default	\N
homepage_1774537398851_rissda	test2	draft	{"hero": {"title": "把商城与课程体验放到一个首页里", "eyebrow": "AI Cross-Stand", "subtitle": "商品成交与内容转化共用一个运营入口", "description": "在后台统一维护首页主视觉、卖点区块和精选课程，前台只负责把内容稳定渲染出来。", "primary_cta": {"href": "/courses", "label": "立即查看课程"}, "secondary_cta": {"href": "/store", "label": "进入商城"}, "background_image_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80"}, "highlights": [{"id": "highlight-1", "icon": "layout", "title": "后台统一维护", "description": "运营同学在 admin 中调整首页文案、按钮和推荐内容，无需改前端代码。"}, {"id": "highlight-2", "icon": "sparkles", "title": "课程与商品联动", "description": "首页可以同时承载课程推荐、商品引流和活动入口。"}, {"id": "highlight-3", "icon": "shield", "title": "前台稳定兜底", "description": "即使后台内容未配置完整，首页依然能使用默认内容正常展示。"}], "featured_courses": [{"id": "featured-course-1", "href": "/courses", "badge": "热门课程", "title": "React 商城实战课", "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80", "description": "用真实商城业务拆解前台页面、状态和数据流设计。"}, {"id": "featured-course-2", "href": "/courses", "badge": "后台实践", "title": "Medusa 后台扩展课", "image_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80", "description": "学习如何扩展 admin、API 与模块，建立面向运营的后台能力。"}]}	\N	2026-03-26 15:03:18.851+00	2026-03-27 15:23:43.354+00	2026-03-27 15:23:43.354+00	test2	f	\N	default	\N
homepage_1774625028801_jtbx2o	main-copy	published	{"template": {"css": ".cms-homepage-template,\\n.cms-homepage {\\n  width: 100%;\\n}\\n\\n.martial-home {\\n  background:\\n    radial-gradient(circle at top, rgba(197, 155, 95, 0.12), transparent 32%),\\n    linear-gradient(180deg, #120f0d 0%, #1c1713 40%, #0e0c0a 100%);\\n  color: #f4ead7;\\n  font-family: \\"Noto Serif SC\\", \\"Source Han Serif SC\\", \\"Songti SC\\", serif;\\n  line-height: 1.6;\\n}\\n\\n.martial-home * {\\n  box-sizing: border-box;\\n}\\n\\n.martial-home a {\\n  color: inherit;\\n  text-decoration: none;\\n}\\n\\n.martial-shell {\\n  width: min(1180px, calc(100% - 48px));\\n  margin: 0 auto;\\n}\\n\\n.martial-section-head {\\n  max-width: 760px;\\n  margin-bottom: 42px;\\n}\\n\\n.martial-section-head span,\\n.martial-masters__content span,\\n.martial-cta__box span {\\n  display: inline-block;\\n  margin-bottom: 14px;\\n  font-size: 12px;\\n  letter-spacing: 0.28em;\\n  text-transform: uppercase;\\n  color: #c9a36a;\\n}\\n\\n.martial-section-head h2,\\n.martial-masters__content h2,\\n.martial-cta__box h2 {\\n  margin: 0 0 16px;\\n  font-size: clamp(30px, 4vw, 52px);\\n  line-height: 1.15;\\n  color: #fff6e8;\\n}\\n\\n.martial-section-head p,\\n.martial-masters__content p,\\n.martial-cta__box p {\\n  margin: 0;\\n  font-size: 17px;\\n  color: rgba(244, 234, 215, 0.78);\\n}\\n\\n.martial-hero {\\n  position: relative;\\n  min-height: 88vh;\\n  display: flex;\\n  align-items: center;\\n  background:\\n    linear-gradient(rgba(10, 8, 7, 0.45), rgba(10, 8, 7, 0.7)),\\n    url(\\"https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1600&q=80\\") center/cover no-repeat;\\n  border-bottom: 1px solid rgba(201, 163, 106, 0.18);\\n}\\n\\n.martial-hero__overlay {\\n  position: absolute;\\n  inset: 0;\\n  background:\\n    radial-gradient(circle at 20% 20%, rgba(201, 163, 106, 0.16), transparent 24%),\\n    linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.42));\\n}\\n\\n.martial-hero__content {\\n  position: relative;\\n  z-index: 1;\\n  padding: 92px 0;\\n  max-width: 860px;\\n}\\n\\n.martial-hero__badge {\\n  display: inline-flex;\\n  align-items: center;\\n  padding: 10px 16px;\\n  border: 1px solid rgba(201, 163, 106, 0.45);\\n  border-radius: 999px;\\n  background: rgba(17, 14, 11, 0.58);\\n  color: #e5c48c;\\n  font-size: 13px;\\n  letter-spacing: 0.16em;\\n  margin-bottom: 22px;\\n}\\n\\n.martial-hero h1 {\\n  margin: 0 0 18px;\\n  font-size: clamp(44px, 7vw, 82px);\\n  line-height: 1.02;\\n  color: #fff8ed;\\n  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);\\n}\\n\\n.martial-hero__lead {\\n  margin: 0;\\n  max-width: 720px;\\n  font-size: clamp(18px, 2vw, 22px);\\n  color: rgba(255, 245, 228, 0.86);\\n}\\n\\n.martial-hero__actions {\\n  display: flex;\\n  flex-wrap: wrap;\\n  gap: 16px;\\n  margin-top: 34px;\\n}\\n\\n.martial-btn {\\n  display: inline-flex;\\n  align-items: center;\\n  justify-content: center;\\n  min-height: 50px;\\n  padding: 0 24px;\\n  border-radius: 999px;\\n  font-size: 15px;\\n  font-weight: 700;\\n  letter-spacing: 0.04em;\\n  transition: transform 0.25s ease, opacity 0.25s ease, background 0.25s ease;\\n}\\n\\n.martial-btn:hover {\\n  transform: translateY(-2px);\\n  opacity: 0.96;\\n}\\n\\n.martial-btn--primary {\\n  background: linear-gradient(135deg, #c79b5f, #e3c38e);\\n  color: #21180f;\\n  box-shadow: 0 10px 28px rgba(199, 155, 95, 0.25);\\n}\\n\\n.martial-btn--ghost {\\n  border: 1px solid rgba(255, 238, 209, 0.35);\\n  background: rgba(255, 255, 255, 0.04);\\n  color: #fff3de;\\n}\\n\\n.martial-hero__stats {\\n  display: grid;\\n  grid-template-columns: repeat(3, minmax(0, 1fr));\\n  gap: 18px;\\n  margin-top: 42px;\\n  max-width: 720px;\\n}\\n\\n.martial-stat {\\n  padding: 20px;\\n  border: 1px solid rgba(201, 163, 106, 0.18);\\n  background: rgba(17, 14, 11, 0.55);\\n  backdrop-filter: blur(4px);\\n  border-radius: 18px;\\n}\\n\\n.martial-stat strong {\\n  display: block;\\n  font-size: 30px;\\n  color: #f2d09b;\\n  margin-bottom: 6px;\\n}\\n\\n.martial-stat span {\\n  font-size: 14px;\\n  color: rgba(255, 240, 214, 0.72);\\n}\\n\\n.martial-intro,\\n.martial-programs,\\n.martial-masters,\\n.martial-benefits,\\n.martial-cta {\\n  padding: 88px 0;\\n}\\n\\n.martial-values,\\n.martial-grid {\\n  display: grid;\\n  gap: 22px;\\n}\\n\\n.martial-values {\\n  grid-template-columns: repeat(3, minmax(0, 1fr));\\n}\\n\\n.martial-grid--three {\\n  grid-template-columns: repeat(3, minmax(0, 1fr));\\n}\\n\\n.martial-grid--four {\\n  grid-template-columns: repeat(4, minmax(0, 1fr));\\n}\\n\\n.martial-card,\\n.martial-program,\\n.martial-benefit {\\n  border: 1px solid rgba(201, 163, 106, 0.16);\\n  border-radius: 24px;\\n  background: linear-gradient(180deg, rgba(34, 27, 21, 0.92), rgba(19, 15, 12, 0.96));\\n  padding: 28px;\\n  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);\\n}\\n\\n.martial-card h3,\\n.martial-program h3,\\n.martial-benefit h3 {\\n  margin: 0 0 12px;\\n  font-size: 24px;\\n  color: #fff6e8;\\n}\\n\\n.martial-card p,\\n.martial-program p,\\n.martial-benefit p {\\n  margin: 0;\\n  color: rgba(244, 234, 215, 0.72);\\n  font-size: 15px;\\n}\\n\\n.martial-program__tag {\\n  display: inline-block;\\n  margin-bottom: 14px;\\n  padding: 7px 12px;\\n  border-radius: 999px;\\n  background: rgba(201, 163, 106, 0.12);\\n  color: #ddb67b;\\n  font-size: 12px;\\n  letter-spacing: 0.08em;\\n}\\n\\n.martial-masters__wrap {\\n  display: grid;\\n  grid-template-columns: 1.05fr 0.95fr;\\n  gap: 36px;\\n  align-items: center;\\n}\\n\\n.martial-masters__image img {\\n  width: 100%;\\n  height: 100%;\\n  min-height: 520px;\\n  object-fit: cover;\\n  border-radius: 28px;\\n  border: 1px solid rgba(201, 163, 106, 0.18);\\n  display: block;\\n}\\n\\n.martial-list {\\n  margin: 24px 0 0;\\n  padding: 0;\\n  list-style: none;\\n}\\n\\n.martial-list li {\\n  position: relative;\\n  padding-left: 22px;\\n  margin-bottom: 12px;\\n  color: rgba(255, 243, 219, 0.78);\\n}\\n\\n.martial-list li::before {\\n  content: \\"\\";\\n  position: absolute;\\n  left: 0;\\n  top: 11px;\\n  width: 8px;\\n  height: 8px;\\n  border-radius: 50%;\\n  background: #c79b5f;\\n  box-shadow: 0 0 0 4px rgba(199, 155, 95, 0.12);\\n}\\n\\n.martial-cta__box {\\n  display: flex;\\n  justify-content: space-between;\\n  align-items: center;\\n  gap: 28px;\\n  padding: 38px;\\n  border-radius: 28px;\\n  background:\\n    linear-gradient(135deg, rgba(201, 163, 106, 0.12), rgba(255, 255, 255, 0.03)),\\n    #17120e;\\n  border: 1px solid rgba(201, 163, 106, 0.2);\\n}\\n\\n.martial-cta__actions {\\n  display: flex;\\n  flex-wrap: wrap;\\n  gap: 14px;\\n  min-width: 240px;\\n  justify-content: flex-end;\\n}\\n\\n@media (max-width: 1100px) {\\n  .martial-values,\\n  .martial-grid--three,\\n  .martial-grid--four,\\n  .martial-masters__wrap,\\n  .martial-hero__stats,\\n  .martial-cta__box {\\n    grid-template-columns: 1fr;\\n  }\\n\\n  .martial-masters__wrap,\\n  .martial-cta__box {\\n    display: grid;\\n  }\\n\\n  .martial-cta__actions {\\n    justify-content: flex-start;\\n  }\\n}\\n\\n@media (max-width: 720px) {\\n  .martial-shell {\\n    width: min(100% - 28px, 1180px);\\n  }\\n\\n  .martial-hero {\\n    min-height: auto;\\n  }\\n\\n  .martial-intro,\\n  .martial-programs,\\n  .martial-masters,\\n  .martial-benefits,\\n  .martial-cta {\\n    padding: 64px 0;\\n  }\\n\\n  .martial-card,\\n  .martial-program,\\n  .martial-benefit,\\n  .martial-cta__box {\\n    padding: 22px;\\n  }\\n\\n  .martial-masters__image img {\\n    min-height: 320px;\\n  }\\n}", "html": "<div class=\\"cms-homepage martial-home\\">\\n  <section class=\\"martial-hero\\">\\n    <div class=\\"martial-hero__overlay\\"></div>\\n    <div class=\\"martial-shell martial-hero__content\\">\\n      <div class=\\"martial-hero__badge\\">传武体系课程平台</div>\\n      <h1>以武修身，以术立骨</h1>\\n      <p class=\\"martial-hero__lead\\">\\n        从少儿武术启蒙、散打实战、防身训练，到成人养生功法与传统拳械体系，\\n        打造一套兼顾精神、体能、技法与气质的现代武术课程体系。\\n      </p>\\n      <div class=\\"martial-hero__actions\\">\\n        <a href=\\"/courses\\" class=\\"martial-btn martial-btn--primary\\">查看课程体系</a>\\n        <a href=\\"/contact\\" class=\\"martial-btn martial-btn--ghost\\">预约体验课</a>\\n      </div>\\n      <div class=\\"martial-hero__stats\\">\\n        <div class=\\"martial-stat\\">\\n          <strong>12+</strong>\\n          <span>核心课程模块</span>\\n        </div>\\n        <div class=\\"martial-stat\\">\\n          <strong>8年</strong>\\n          <span>教学体系沉淀</span>\\n        </div>\\n        <div class=\\"martial-stat\\">\\n          <strong>3000+</strong>\\n          <span>累计学员训练</span>\\n        </div>\\n      </div>\\n    </div>\\n  </section>\\n\\n  <section class=\\"martial-intro\\">\\n    <div class=\\"martial-shell\\">\\n      <div class=\\"martial-section-head\\">\\n        <span>宗旨理念</span>\\n        <h2>不止教动作，更重视人的精神、筋骨与气息</h2>\\n        <p>\\n          武术不是单一的表演，也不是简单的体能课。我们以传统武学精神为根，\\n          结合现代训练方法，让初学者学得稳、学得正，也让进阶者练得深、练得久。\\n        </p>\\n      </div>\\n\\n      <div class=\\"martial-values\\">\\n        <article class=\\"martial-card\\">\\n          <h3>正身</h3>\\n          <p>重视站姿、步法、身法和发力结构，建立扎实的身体控制能力。</p>\\n        </article>\\n        <article class=\\"martial-card\\">\\n          <h3>养气</h3>\\n          <p>通过呼吸、节奏与功法训练，提升专注力、耐心与稳定情绪。</p>\\n        </article>\\n        <article class=\\"martial-card\\">\\n          <h3>明礼</h3>\\n          <p>以礼入武，以武养德，让课程不仅培养技艺，也塑造品格。</p>\\n        </article>\\n      </div>\\n    </div>\\n  </section>\\n\\n  <section class=\\"martial-programs\\">\\n    <div class=\\"martial-shell\\">\\n      <div class=\\"martial-section-head\\">\\n        <span>课程体系</span>\\n        <h2>从入门到进阶，兼顾少儿、成人与实战训练</h2>\\n      </div>\\n\\n      <div class=\\"martial-grid martial-grid--three\\">\\n        <article class=\\"martial-program\\">\\n          <div class=\\"martial-program__tag\\">少儿启蒙</div>\\n          <h3>少儿武术基础班</h3>\\n          <p>培养专注力、协调性、柔韧性与礼仪习惯，让孩子建立自信和纪律感。</p>\\n        </article>\\n\\n        <article class=\\"martial-program\\">\\n          <div class=\\"martial-program__tag\\">成人进修</div>\\n          <h3>传统拳法系统班</h3>\\n          <p>系统学习基本功、单练套路、对练方法与拳理结构，重在完整传承。</p>\\n        </article>\\n\\n        <article class=\\"martial-program\\">\\n          <div class=\\"martial-program__tag\\">实战方向</div>\\n          <h3>散打与防身应用班</h3>\\n          <p>围绕步法、距离、反应、攻防转换与自我保护建立实用能力。</p>\\n        </article>\\n\\n        <article class=\\"martial-program\\">\\n          <div class=\\"martial-program__tag\\">养生训练</div>\\n          <h3>功法与体能修复班</h3>\\n          <p>适合长期久坐、体态失衡或需要恢复训练的人群，兼顾养生与体质提升。</p>\\n        </article>\\n\\n        <article class=\\"martial-program\\">\\n          <div class=\\"martial-program__tag\\">兵器专项</div>\\n          <h3>刀枪剑棍专项课</h3>\\n          <p>学习传统器械基础，训练节奏、线路、身械配合与演练气势。</p>\\n        </article>\\n\\n        <article class=\\"martial-program\\">\\n          <div class=\\"martial-program__tag\\">高阶沉淀</div>\\n          <h3>教练成长班</h3>\\n          <p>面向长期学习者，强化教学表达、动作拆解与课程带练能力。</p>\\n        </article>\\n      </div>\\n    </div>\\n  </section>\\n\\n  <section class=\\"martial-masters\\">\\n    <div class=\\"martial-shell martial-masters__wrap\\">\\n      <div class=\\"martial-masters__image\\">\\n        <img src=\\"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80\\" alt=\\"武术导师训练展示\\">\\n      </div>\\n      <div class=\\"martial-masters__content\\">\\n        <span>师资团队</span>\\n        <h2>有传承，也有教学方法</h2>\\n        <p>\\n          教学团队由传统武术教练、散打训练师和体能导师共同组成。\\n          既注重动作标准和拳术逻辑，也强调教学节奏、个体差异与长期成长路径。\\n        </p>\\n        <ul class=\\"martial-list\\">\\n          <li>小班教学，关注每位学员动作纠正</li>\\n          <li>阶段式训练目标，避免盲练与乱练</li>\\n          <li>基础、进阶、专项课清晰分层</li>\\n        </ul>\\n      </div>\\n    </div>\\n  </section>\\n\\n  <section class=\\"martial-benefits\\">\\n    <div class=\\"martial-shell\\">\\n      <div class=\\"martial-section-head\\">\\n        <span>训练收获</span>\\n        <h2>练武之后，改变的不只是力量</h2>\\n      </div>\\n\\n      <div class=\\"martial-grid martial-grid--four\\">\\n        <article class=\\"martial-benefit\\">\\n          <h3>体能提升</h3>\\n          <p>增强力量、速度、柔韧与耐力，改善日常身体状态。</p>\\n        </article>\\n        <article class=\\"martial-benefit\\">\\n          <h3>专注稳定</h3>\\n          <p>通过重复打磨动作与节奏控制，提升注意力和心性稳定度。</p>\\n        </article>\\n        <article class=\\"martial-benefit\\">\\n          <h3>防身意识</h3>\\n          <p>建立距离感、反应能力与基本自护逻辑，更有安全感。</p>\\n        </article>\\n        <article class=\\"martial-benefit\\">\\n          <h3>文化气质</h3>\\n          <p>在礼仪、克制与坚持中，形成从容、有分寸的精神面貌。</p>\\n        </article>\\n      </div>\\n    </div>\\n  </section>\\n\\n  <section class=\\"martial-cta\\">\\n    <div class=\\"martial-shell martial-cta__box\\">\\n      <div>\\n        <span>现在开始</span>\\n        <h2>预约一节体验课，走进真正的武术训练</h2>\\n        <p>\\n          不论你是零基础初学者、希望孩子接受系统训练，还是想重新找回身体状态，\\n          都可以从一节体验课开始。\\n        </p>\\n      </div>\\n      <div class=\\"martial-cta__actions\\">\\n        <a href=\\"/contact\\" class=\\"martial-btn martial-btn--primary\\">立即预约</a>\\n        <a href=\\"/courses\\" class=\\"martial-btn martial-btn--ghost\\">浏览全部课程</a>\\n      </div>\\n    </div>\\n  </section>\\n</div>"}, "render_mode": "static_html"}	\N	2026-03-27 15:23:48.801+00	2026-03-28 15:36:30.111+00	\N	Default Homepage 副本	t	2026-03-28 15:36:30.111+00	default	\N
\.


--
-- TOC entry 5209 (class 0 OID 16686)
-- Dependencies: 248
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.image (id, url, metadata, created_at, updated_at, deleted_at, rank, product_id) FROM stdin;
rqjrui	https://admin.wolzq.com/uploads/1775407082606-course1.jpeg	\N	2026-04-05 16:38:02.937+00	2026-04-05 16:38:02.937+00	\N	0	prod_01KKS0NXER6GCXWSYYHDT5E9TE
cb21i8	https://admin.wolzq.com/uploads/1775407132845-course2.jpeg	\N	2026-04-05 16:38:53.62+00	2026-04-05 16:38:53.62+00	\N	0	prod_01KKS0NXER8KYP7V0W4MVZXJGB
yly5a	https://admin.wolzq.com/uploads/1775407172882-course3.jpeg	\N	2026-04-05 16:39:33.195+00	2026-04-05 16:39:33.195+00	\N	0	prod_01KKS0NXERTEZQTGVZJHWQQM2A
kf4h24	https://admin.wolzq.com/uploads/1775407196734-course4.jpeg	\N	2026-04-05 16:39:57.005+00	2026-04-05 16:39:57.005+00	\N	0	prod_01KKS0NXERW0SFT7YBHB0PQDC4
\.


--
-- TOC entry 5210 (class 0 OID 16694)
-- Dependencies: 249
-- Data for Name: inventory_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_item (id, created_at, updated_at, deleted_at, sku, origin_country, hs_code, mid_code, material, weight, length, height, width, requires_shipping, description, title, thumbnail, metadata) FROM stdin;
iitem_01KKS0NXK375PKK6QFGMNM3JJP	2026-03-15 15:08:50.662+00	2026-03-15 15:08:50.662+00	\N	SHIRT-S-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	S / Black	S / Black	\N	\N
iitem_01KKS0NXK4ABJNW3M2KG25FWH8	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHIRT-S-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	S / White	S / White	\N	\N
iitem_01KKS0NXK4GDJFR4Y8M2WJQMPG	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHIRT-M-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	M / Black	M / Black	\N	\N
iitem_01KKS0NXK4KQ1T39EF89079SXD	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHIRT-M-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	M / White	M / White	\N	\N
iitem_01KKS0NXK4186ZE627VQM4W9DS	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHIRT-L-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	L / Black	L / Black	\N	\N
iitem_01KKS0NXK4FGW5QTT1P9M5GXMG	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHIRT-L-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	L / White	L / White	\N	\N
iitem_01KKS0NXK4DH32BEN4Y90Z2WCE	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHIRT-XL-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	XL / Black	XL / Black	\N	\N
iitem_01KKS0NXK4R65Z65WSAZBTKYYZ	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHIRT-XL-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	XL / White	XL / White	\N	\N
iitem_01KKS0NXK49C9HTJ2XZTS0EKPA	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SWEATSHIRT-S	\N	\N	\N	\N	\N	\N	\N	\N	t	S	S	\N	\N
iitem_01KKS0NXK5B0T0EE57TJ5WM8A8	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SWEATSHIRT-M	\N	\N	\N	\N	\N	\N	\N	\N	t	M	M	\N	\N
iitem_01KKS0NXK5EBVCGBYF1Y95VN34	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SWEATSHIRT-L	\N	\N	\N	\N	\N	\N	\N	\N	t	L	L	\N	\N
iitem_01KKS0NXK5HFJDNH01JDYAE734	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SWEATSHIRT-XL	\N	\N	\N	\N	\N	\N	\N	\N	t	XL	XL	\N	\N
iitem_01KKS0NXK56M41XVZPG3CTWXQB	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SWEATPANTS-S	\N	\N	\N	\N	\N	\N	\N	\N	t	S	S	\N	\N
iitem_01KKS0NXK5KZCDPB4XQNG9WMAK	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SWEATPANTS-M	\N	\N	\N	\N	\N	\N	\N	\N	t	M	M	\N	\N
iitem_01KKS0NXK57VB0SSTSNFP2Z2BB	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SWEATPANTS-L	\N	\N	\N	\N	\N	\N	\N	\N	t	L	L	\N	\N
iitem_01KKS0NXK500RPZ4VD6VTV4KGN	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SWEATPANTS-XL	\N	\N	\N	\N	\N	\N	\N	\N	t	XL	XL	\N	\N
iitem_01KKS0NXK5HZKVWKVHR1YMM4HK	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHORTS-S	\N	\N	\N	\N	\N	\N	\N	\N	t	S	S	\N	\N
iitem_01KKS0NXK5HQYV4KH1AZBF6DBK	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHORTS-M	\N	\N	\N	\N	\N	\N	\N	\N	t	M	M	\N	\N
iitem_01KKS0NXK6T2W9PWEZMM8CRCTD	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHORTS-L	\N	\N	\N	\N	\N	\N	\N	\N	t	L	L	\N	\N
iitem_01KKS0NXK60S34JCZ059ND2HHM	2026-03-15 15:08:50.663+00	2026-03-15 15:08:50.663+00	\N	SHORTS-XL	\N	\N	\N	\N	\N	\N	\N	\N	t	XL	XL	\N	\N
\.


--
-- TOC entry 5211 (class 0 OID 16702)
-- Dependencies: 250
-- Data for Name: inventory_level; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_level (id, created_at, updated_at, deleted_at, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, metadata, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity) FROM stdin;
ilev_01KKS0NXQJ820S82ZMHM5K7H1C	2026-03-15 15:08:50.804+00	2026-03-15 15:08:50.804+00	\N	iitem_01KKS0NXK375PKK6QFGMNM3JJP	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQJ5Q8WKSKFR560NMBE	2026-03-15 15:08:50.804+00	2026-03-15 15:08:50.804+00	\N	iitem_01KKS0NXK4ABJNW3M2KG25FWH8	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQJJHMPXJ5P5R4GM3XX	2026-03-15 15:08:50.804+00	2026-03-15 15:08:50.804+00	\N	iitem_01KKS0NXK4DH32BEN4Y90Z2WCE	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQJXSKK8884031X9FRR	2026-03-15 15:08:50.804+00	2026-03-15 15:08:50.804+00	\N	iitem_01KKS0NXK4FGW5QTT1P9M5GXMG	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQJY6PX2K4JBBX1EDY7	2026-03-15 15:08:50.804+00	2026-03-15 15:08:50.804+00	\N	iitem_01KKS0NXK4KQ1T39EF89079SXD	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQK0VDR0DSCWWARPM0H	2026-03-15 15:08:50.804+00	2026-03-15 15:08:50.804+00	\N	iitem_01KKS0NXK4R65Z65WSAZBTKYYZ	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQK8N2BFKYA5HGAWVEQ	2026-03-15 15:08:50.804+00	2026-03-15 15:08:50.804+00	\N	iitem_01KKS0NXK57VB0SSTSNFP2Z2BB	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQKRN7S3VTSFPQGM0AQ	2026-03-15 15:08:50.804+00	2026-03-15 15:08:50.805+00	\N	iitem_01KKS0NXK5HFJDNH01JDYAE734	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQKFJ4RSPNN3VP0GRWV	2026-03-15 15:08:50.805+00	2026-03-15 15:08:50.805+00	\N	iitem_01KKS0NXK5HQYV4KH1AZBF6DBK	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQM1JR4J7F8TZWGKAS9	2026-03-15 15:08:50.805+00	2026-03-15 15:08:50.805+00	\N	iitem_01KKS0NXK60S34JCZ059ND2HHM	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQMSSZZT7JS2N3W7KKK	2026-03-15 15:08:50.805+00	2026-03-15 15:08:50.805+00	\N	iitem_01KKS0NXK6T2W9PWEZMM8CRCTD	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQJ21YTQ2ANANRHBDV9	2026-03-15 15:08:50.804+00	2026-03-22 14:36:55.061+00	\N	iitem_01KKS0NXK4186ZE627VQM4W9DS	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	2	0	\N	{"value": "1000000", "precision": 20}	{"value": "2", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQJQXPPSBC0AHVERGQT	2026-03-15 15:08:50.804+00	2026-03-22 14:49:13.25+00	\N	iitem_01KKS0NXK4GDJFR4Y8M2WJQMPG	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	1	0	\N	{"value": "1000000", "precision": 20}	{"value": "1", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQKG595SAG7MVP5HWMC	2026-03-15 15:08:50.804+00	2026-03-27 16:46:26.785+00	\N	iitem_01KKS0NXK5B0T0EE57TJ5WM8A8	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	1	0	\N	{"value": "1000000", "precision": 20}	{"value": "1", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQKQNEVZS9NM6Z2ND3G	2026-03-15 15:08:50.804+00	2026-03-29 13:30:22.957+00	\N	iitem_01KKS0NXK500RPZ4VD6VTV4KGN	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	6	0	\N	{"value": "1000000", "precision": 20}	{"value": "6", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQKNRREDD57RH7MNTBS	2026-03-15 15:08:50.804+00	2026-03-29 13:30:22.957+00	\N	iitem_01KKS0NXK56M41XVZPG3CTWXQB	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	1	0	\N	{"value": "1000000", "precision": 20}	{"value": "1", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQK0J0VPDA72HW5BV7B	2026-03-15 15:08:50.804+00	2026-03-29 13:30:22.957+00	\N	iitem_01KKS0NXK5EBVCGBYF1Y95VN34	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	18	0	\N	{"value": "1000000", "precision": 20}	{"value": "18", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQMCTKF9HQ0FXQPZXAX	2026-03-15 15:08:50.805+00	2026-03-29 13:30:22.957+00	\N	iitem_01KKS0NXK5KZCDPB4XQNG9WMAK	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	1	0	\N	{"value": "1000000", "precision": 20}	{"value": "1", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQJWZXNKS7JF5EQWTH1	2026-03-15 15:08:50.804+00	2026-04-05 12:56:44.884+00	\N	iitem_01KKS0NXK49C9HTJ2XZTS0EKPA	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	1	0	\N	{"value": "1000000", "precision": 20}	{"value": "1", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKS0NXQK9Q5BNYF5Y9K66W5S	2026-03-15 15:08:50.805+00	2026-04-05 12:56:44.884+00	\N	iitem_01KKS0NXK5HZKVWKVHR1YMM4HK	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1000000	1	0	\N	{"value": "1000000", "precision": 20}	{"value": "1", "precision": 20}	{"value": "0", "precision": 20}
\.


--
-- TOC entry 5212 (class 0 OID 16712)
-- Dependencies: 251
-- Data for Name: invite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invite (id, email, accepted, token, expires_at, metadata, created_at, updated_at, deleted_at) FROM stdin;
invite_01KKS0NJMYSQ7TR4CQEG0221QC	admin@medusa-test.com	f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imludml0ZV8wMUtLUzBOSk1ZU1E3VFI0Q1FFRzAyMjFRQyIsImVtYWlsIjoiYWRtaW5AbWVkdXNhLXRlc3QuY29tIiwiaWF0IjoxNzczNTg3MzE5LCJleHAiOjE3NzM2NzM3MTksImp0aSI6IjY1MjY4OWU0LTdiODQtNDhmMC04MGMxLTFmZjIxM2E1OTEzNCJ9.dr2fVylmQ96qK5ql2cmxuoo8OK0jKuY2ARgR_nDuZII	2026-03-16 15:08:39.454+00	\N	2026-03-15 15:08:39.459+00	2026-03-15 15:10:16.212+00	2026-03-15 15:10:16.211+00
\.


--
-- TOC entry 5213 (class 0 OID 16720)
-- Dependencies: 252
-- Data for Name: lesson; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson (id, course_id, title, description, episode_number, duration, is_free, thumbnail_url, video_url, status, metadata, created_at, updated_at, deleted_at, translations) FROM stdin;
lesson_c2_2	course_demo_2	第2集：Server Components vs Client Components	掌握两种组件模式的边界与最佳实践。	2	900	t	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course3.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:10:39.494+00	\N	\N
lesson_c2_3	course_demo_2	第3集：数据获取与缓存策略	fetch 缓存与 revalidate 的使用。	3	1050	f	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course3.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:10:44.464+00	\N	\N
lesson_c2_4	course_demo_2	第4集：Server Actions 全解析	使用 Server Actions 处理表单提交与数据变更。	4	960	f	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course3.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:10:48.893+00	\N	\N
lesson_c1_4	course_demo_1	第4集：项目实战 —— Todo App	综合运用所学知识，构建一个完整的 Todo 应用并部署上线。	4	1800	f	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course1.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:08:20.901+00	\N	\N
lesson_c2_5	course_demo_2	第5集：中间件与鉴权	利用 Middleware 实现路由守卫与鉴权。	5	1100	f	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course3.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:10:53.772+00	\N	\N
lesson_c2_6	course_demo_2	第6集：数据库集成 —— PostgreSQL	在项目中集成并使用 PostgreSQL。	6	1350	f	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course3.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:11:00.836+00	\N	\N
lesson_c2_7	course_demo_2	第7集：部署	部署全栈应用并配置环境变量。	7	840	f	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course3.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:11:06.873+00	\N	\N
lesson_c1_3	course_demo_1	第3集：useState 与 useEffect	深入理解 React 核心 Hooks 的使用场景与陷阱。	3	1200	f	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course1.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:08:56.778+00	\N	\N
lesson_c1_1	course_demo_1	第1集：开发环境搭建	安装 Node.js、VS Code 并初始化第一个 React 项目。	1	600	t	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course1.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:09:27.228+00	\N	\N
lesson_c1_2	course_demo_1	第2集：JSX 与组件基础	学习 JSX 语法、函数组件与 Props 传递。	2	780	t	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course1.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:09:31.063+00	\N	\N
lesson_1774279500120_skvgnj	course-demo-3	test1	test1	1	54	t	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course2.jpeg	https://www.baidu.com	published	\N	2026-03-23 15:25:00.12+00	2026-04-05 14:09:58.386+00	\N	\N
lesson_1774279563459_l866rx	course-demo-3	test2	test2	2	600	f	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course2.jpeg	https://www.baidu.com	published	\N	2026-03-23 15:26:03.459+00	2026-04-05 14:10:03.988+00	\N	\N
lesson_c2_1	course_demo_2	第1集：App Router 核心概念	理解 Next.js App Router 目录结构与路由规则。	1	720	t	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course3.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:10:35.869+00	\N	\N
lesson_c2_8	course_demo_2	第8集：性能优化与监控	常用性能优化手段与监控接入。	8	1200	f	https://medusa-1255646977.cos.ap-hongkong.myqcloud.com/course3.jpeg	https://www.w3schools.com/html/mov_bbb.mp4	published	{}	2026-03-19 16:02:31.917351+00	2026-04-05 14:11:11.499+00	\N	\N
\.


--
-- TOC entry 5214 (class 0 OID 16730)
-- Dependencies: 253
-- Data for Name: link_module_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.link_module_migrations (id, table_name, link_descriptor, created_at) FROM stdin;
1	cart_payment_collection	{"toModel": "payment_collection", "toModule": "payment", "fromModel": "cart", "fromModule": "cart"}	2026-03-15 23:08:17.828231
2	cart_promotion	{"toModel": "promotions", "toModule": "promotion", "fromModel": "cart", "fromModule": "cart"}	2026-03-15 23:08:17.850039
3	customer_account_holder	{"toModel": "account_holder", "toModule": "payment", "fromModel": "customer", "fromModule": "customer"}	2026-03-15 23:08:17.864146
4	location_fulfillment_provider	{"toModel": "fulfillment_provider", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}	2026-03-15 23:08:17.881207
5	location_fulfillment_set	{"toModel": "fulfillment_set", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}	2026-03-15 23:08:17.894658
6	order_cart	{"toModel": "cart", "toModule": "cart", "fromModel": "order", "fromModule": "order"}	2026-03-15 23:08:17.908911
7	order_fulfillment	{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "order", "fromModule": "order"}	2026-03-15 23:08:17.921737
8	order_payment_collection	{"toModel": "payment_collection", "toModule": "payment", "fromModel": "order", "fromModule": "order"}	2026-03-15 23:08:17.936016
9	order_promotion	{"toModel": "promotions", "toModule": "promotion", "fromModel": "order", "fromModule": "order"}	2026-03-15 23:08:17.947695
10	return_fulfillment	{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "return", "fromModule": "order"}	2026-03-15 23:08:17.961105
11	product_sales_channel	{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "product", "fromModule": "product"}	2026-03-15 23:08:17.973822
12	product_shipping_profile	{"toModel": "shipping_profile", "toModule": "fulfillment", "fromModel": "product", "fromModule": "product"}	2026-03-15 23:08:17.989839
13	product_variant_inventory_item	{"toModel": "inventory", "toModule": "inventory", "fromModel": "variant", "fromModule": "product"}	2026-03-15 23:08:18.0018
14	product_variant_price_set	{"toModel": "price_set", "toModule": "pricing", "fromModel": "variant", "fromModule": "product"}	2026-03-15 23:08:18.013263
15	publishable_api_key_sales_channel	{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "api_key", "fromModule": "api_key"}	2026-03-15 23:08:18.025872
16	region_payment_provider	{"toModel": "payment_provider", "toModule": "payment", "fromModel": "region", "fromModule": "region"}	2026-03-15 23:08:18.040451
17	sales_channel_stock_location	{"toModel": "location", "toModule": "stock_location", "fromModel": "sales_channel", "fromModule": "sales_channel"}	2026-03-15 23:08:18.055157
18	shipping_option_price_set	{"toModel": "price_set", "toModule": "pricing", "fromModel": "shipping_option", "fromModule": "fulfillment"}	2026-03-15 23:08:18.068627
19	user_rbac_role	{"toModel": "rbac_role", "toModule": "rbac", "fromModel": "user", "fromModule": "user"}	2026-03-15 23:08:18.08109
\.


--
-- TOC entry 5216 (class 0 OID 16739)
-- Dependencies: 255
-- Data for Name: location_fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_fulfillment_provider (stock_location_id, fulfillment_provider_id, id, created_at, updated_at, deleted_at) FROM stdin;
sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	manual_manual	locfp_01KKS0NX79BWFPSPWY4DC6J955	2026-03-15 15:08:50.281251+00	2026-03-15 15:08:50.281251+00	\N
sloc_01KM3CFSNZZGHBWJB90XMFQ0S4	manual_manual	locfp_01KM3CFSPZG54SERK6B6JABF5Z	2026-03-19 15:47:37.31091+00	2026-03-19 15:47:37.31091+00	\N
sloc_01KM3CPMM63G7830NJVGR3J8X7	manual_manual	locfp_01KM3CPMN2W57N93HQRSWK9T1M	2026-03-19 15:51:21.507003+00	2026-03-19 15:51:21.507003+00	\N
sloc_01KM3CW27X1F33JCWVSTPQKK36	manual_manual	locfp_01KM3CW28S1GBVK8C6HWY2V57E	2026-03-19 15:54:19.287621+00	2026-03-19 15:54:19.287621+00	\N
\.


--
-- TOC entry 5217 (class 0 OID 16746)
-- Dependencies: 256
-- Data for Name: location_fulfillment_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_fulfillment_set (stock_location_id, fulfillment_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	fuset_01KKS0NX7TQC2MQRKB74P3VNNP	locfs_01KKS0NX8HJ5F17BSPHCGDQAHS	2026-03-15 15:08:50.321207+00	2026-03-15 15:08:50.321207+00	\N
\.


--
-- TOC entry 5218 (class 0 OID 16753)
-- Dependencies: 257
-- Data for Name: mikro_orm_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mikro_orm_migrations (id, name, executed_at) FROM stdin;
1	Migration20240307161216	2026-03-15 15:08:02.438024+00
2	Migration20241210073813	2026-03-15 15:08:02.438024+00
3	Migration20250106142624	2026-03-15 15:08:02.438024+00
4	Migration20250120110820	2026-03-15 15:08:02.438024+00
5	Migration20240307132720	2026-03-15 15:08:02.967843+00
6	Migration20240719123015	2026-03-15 15:08:02.967843+00
7	Migration20241213063611	2026-03-15 15:08:02.967843+00
8	Migration20251010131115	2026-03-15 15:08:02.967843+00
9	InitialSetup20240401153642	2026-03-15 15:08:03.324911+00
10	Migration20240601111544	2026-03-15 15:08:03.324911+00
11	Migration202408271511	2026-03-15 15:08:03.324911+00
12	Migration20241122120331	2026-03-15 15:08:03.324911+00
13	Migration20241125090957	2026-03-15 15:08:03.324911+00
14	Migration20250411073236	2026-03-15 15:08:03.324911+00
15	Migration20250516081326	2026-03-15 15:08:03.324911+00
16	Migration20250910154539	2026-03-15 15:08:03.324911+00
17	Migration20250911092221	2026-03-15 15:08:03.324911+00
18	Migration20250929204438	2026-03-15 15:08:03.324911+00
19	Migration20251008132218	2026-03-15 15:08:03.324911+00
20	Migration20251011090511	2026-03-15 15:08:03.324911+00
21	Migration20230929122253	2026-03-15 15:08:03.993588+00
22	Migration20240322094407	2026-03-15 15:08:03.993588+00
23	Migration20240322113359	2026-03-15 15:08:03.993588+00
24	Migration20240322120125	2026-03-15 15:08:03.993588+00
25	Migration20240626133555	2026-03-15 15:08:03.993588+00
26	Migration20240704094505	2026-03-15 15:08:03.993588+00
27	Migration20241127114534	2026-03-15 15:08:03.993588+00
28	Migration20241127223829	2026-03-15 15:08:03.993588+00
29	Migration20241128055359	2026-03-15 15:08:03.993588+00
30	Migration20241212190401	2026-03-15 15:08:03.993588+00
31	Migration20250408145122	2026-03-15 15:08:03.993588+00
32	Migration20250409122219	2026-03-15 15:08:03.993588+00
33	Migration20251009110625	2026-03-15 15:08:03.993588+00
34	Migration20251112192723	2026-03-15 15:08:03.993588+00
35	Migration20240227120221	2026-03-15 15:08:04.576802+00
36	Migration20240617102917	2026-03-15 15:08:04.576802+00
37	Migration20240624153824	2026-03-15 15:08:04.576802+00
38	Migration20241211061114	2026-03-15 15:08:04.576802+00
39	Migration20250113094144	2026-03-15 15:08:04.576802+00
40	Migration20250120110700	2026-03-15 15:08:04.576802+00
41	Migration20250226130616	2026-03-15 15:08:04.576802+00
42	Migration20250508081510	2026-03-15 15:08:04.576802+00
43	Migration20250828075407	2026-03-15 15:08:04.576802+00
44	Migration20250909083125	2026-03-15 15:08:04.576802+00
45	Migration20250916120552	2026-03-15 15:08:04.576802+00
46	Migration20250917143818	2026-03-15 15:08:04.576802+00
47	Migration20250919122137	2026-03-15 15:08:04.576802+00
48	Migration20251006000000	2026-03-15 15:08:04.576802+00
49	Migration20251015113934	2026-03-15 15:08:04.576802+00
50	Migration20251107050148	2026-03-15 15:08:04.576802+00
51	Migration20240124154000	2026-03-15 15:08:05.169424+00
52	Migration20240524123112	2026-03-15 15:08:05.169424+00
53	Migration20240602110946	2026-03-15 15:08:05.169424+00
54	Migration20241211074630	2026-03-15 15:08:05.169424+00
55	Migration20251010130829	2026-03-15 15:08:05.169424+00
56	Migration20240115152146	2026-03-15 15:08:05.791664+00
57	Migration20240222170223	2026-03-15 15:08:06.066609+00
58	Migration20240831125857	2026-03-15 15:08:06.066609+00
59	Migration20241106085918	2026-03-15 15:08:06.066609+00
60	Migration20241205095237	2026-03-15 15:08:06.066609+00
61	Migration20241216183049	2026-03-15 15:08:06.066609+00
62	Migration20241218091938	2026-03-15 15:08:06.066609+00
63	Migration20250120115059	2026-03-15 15:08:06.066609+00
64	Migration20250212131240	2026-03-15 15:08:06.066609+00
65	Migration20250326151602	2026-03-15 15:08:06.066609+00
66	Migration20250508081553	2026-03-15 15:08:06.066609+00
67	Migration20251017153909	2026-03-15 15:08:06.066609+00
68	Migration20251208130704	2026-03-15 15:08:06.066609+00
69	Migration20240205173216	2026-03-15 15:08:06.514888+00
70	Migration20240624200006	2026-03-15 15:08:06.514888+00
71	Migration20250120110744	2026-03-15 15:08:06.514888+00
72	InitialSetup20240221144943	2026-03-15 15:08:06.922918+00
73	Migration20240604080145	2026-03-15 15:08:06.922918+00
74	Migration20241205122700	2026-03-15 15:08:06.922918+00
75	Migration20251015123842	2026-03-15 15:08:06.922918+00
76	InitialSetup20240227075933	2026-03-15 15:08:07.307668+00
77	Migration20240621145944	2026-03-15 15:08:07.307668+00
78	Migration20241206083313	2026-03-15 15:08:07.307668+00
79	Migration20251202184737	2026-03-15 15:08:07.307668+00
80	Migration20251212161429	2026-03-15 15:08:07.307668+00
81	Migration20240227090331	2026-03-15 15:08:07.855731+00
82	Migration20240710135844	2026-03-15 15:08:07.855731+00
83	Migration20240924114005	2026-03-15 15:08:07.855731+00
84	Migration20241212052837	2026-03-15 15:08:07.855731+00
85	InitialSetup20240228133303	2026-03-15 15:08:08.311836+00
86	Migration20240624082354	2026-03-15 15:08:08.311836+00
87	Migration20240225134525	2026-03-15 15:08:08.603564+00
88	Migration20240806072619	2026-03-15 15:08:08.603564+00
89	Migration20241211151053	2026-03-15 15:08:08.603564+00
90	Migration20250115160517	2026-03-15 15:08:08.603564+00
91	Migration20250120110552	2026-03-15 15:08:08.603564+00
92	Migration20250123122334	2026-03-15 15:08:08.603564+00
93	Migration20250206105639	2026-03-15 15:08:08.603564+00
94	Migration20250207132723	2026-03-15 15:08:08.603564+00
95	Migration20250625084134	2026-03-15 15:08:08.603564+00
96	Migration20250924135437	2026-03-15 15:08:08.603564+00
97	Migration20250929124701	2026-03-15 15:08:08.603564+00
98	Migration20240219102530	2026-03-15 15:08:09.031171+00
99	Migration20240604100512	2026-03-15 15:08:09.031171+00
100	Migration20240715102100	2026-03-15 15:08:09.031171+00
101	Migration20240715174100	2026-03-15 15:08:09.031171+00
102	Migration20240716081800	2026-03-15 15:08:09.031171+00
103	Migration20240801085921	2026-03-15 15:08:09.031171+00
104	Migration20240821164505	2026-03-15 15:08:09.031171+00
105	Migration20240821170920	2026-03-15 15:08:09.031171+00
106	Migration20240827133639	2026-03-15 15:08:09.031171+00
107	Migration20240902195921	2026-03-15 15:08:09.031171+00
108	Migration20240913092514	2026-03-15 15:08:09.031171+00
109	Migration20240930122627	2026-03-15 15:08:09.031171+00
110	Migration20241014142943	2026-03-15 15:08:09.031171+00
111	Migration20241106085223	2026-03-15 15:08:09.031171+00
112	Migration20241129124827	2026-03-15 15:08:09.031171+00
113	Migration20241217162224	2026-03-15 15:08:09.031171+00
114	Migration20250326151554	2026-03-15 15:08:09.031171+00
115	Migration20250522181137	2026-03-15 15:08:09.031171+00
116	Migration20250702095353	2026-03-15 15:08:09.031171+00
117	Migration20250704120229	2026-03-15 15:08:09.031171+00
118	Migration20250910130000	2026-03-15 15:08:09.031171+00
119	Migration20251016160403	2026-03-15 15:08:09.031171+00
120	Migration20251016182939	2026-03-15 15:08:09.031171+00
121	Migration20251017155709	2026-03-15 15:08:09.031171+00
122	Migration20251114100559	2026-03-15 15:08:09.031171+00
123	Migration20251125164002	2026-03-15 15:08:09.031171+00
124	Migration20251210112909	2026-03-15 15:08:09.031171+00
125	Migration20251210112924	2026-03-15 15:08:09.031171+00
126	Migration20251225120947	2026-03-15 15:08:09.031171+00
127	Migration20250717162007	2026-03-15 15:08:10.086123+00
128	Migration20240205025928	2026-03-15 15:08:10.353447+00
129	Migration20240529080336	2026-03-15 15:08:10.353447+00
130	Migration20241202100304	2026-03-15 15:08:10.353447+00
131	Migration20240214033943	2026-03-15 15:08:11.138565+00
132	Migration20240703095850	2026-03-15 15:08:11.138565+00
133	Migration20241202103352	2026-03-15 15:08:11.138565+00
134	Migration20240311145700_InitialSetupMigration	2026-03-15 15:08:11.627466+00
135	Migration20240821170957	2026-03-15 15:08:11.627466+00
136	Migration20240917161003	2026-03-15 15:08:11.627466+00
137	Migration20241217110416	2026-03-15 15:08:11.627466+00
138	Migration20250113122235	2026-03-15 15:08:11.627466+00
139	Migration20250120115002	2026-03-15 15:08:11.627466+00
140	Migration20250822130931	2026-03-15 15:08:11.627466+00
141	Migration20250825132614	2026-03-15 15:08:11.627466+00
142	Migration20251114133146	2026-03-15 15:08:11.627466+00
143	Migration20240509083918_InitialSetupMigration	2026-03-15 15:08:12.45885+00
144	Migration20240628075401	2026-03-15 15:08:12.45885+00
145	Migration20240830094712	2026-03-15 15:08:12.45885+00
146	Migration20250120110514	2026-03-15 15:08:12.45885+00
147	Migration20251028172715	2026-03-15 15:08:12.45885+00
148	Migration20251121123942	2026-03-15 15:08:12.45885+00
149	Migration20251121150408	2026-03-15 15:08:12.45885+00
150	Migration20231228143900	2026-03-15 15:08:13.713499+00
151	Migration20241206101446	2026-03-15 15:08:13.713499+00
152	Migration20250128174331	2026-03-15 15:08:13.713499+00
153	Migration20250505092459	2026-03-15 15:08:13.713499+00
154	Migration20250819104213	2026-03-15 15:08:13.713499+00
155	Migration20250819110924	2026-03-15 15:08:13.713499+00
156	Migration20250908080305	2026-03-15 15:08:13.713499+00
157	Migration20260319152426	2026-03-19 15:25:52.835501+00
158	Migration20260326120000	2026-03-26 14:38:21.90513+00
159	Migration20260326143000	2026-03-26 14:52:01.49967+00
160	Migration20260328100000	2026-03-28 15:02:31.916104+00
161	Migration20260329100000	2026-03-29 07:28:33.130542+00
\.


--
-- TOC entry 5220 (class 0 OID 16758)
-- Dependencies: 259
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, "to", channel, template, data, trigger_type, resource_id, resource_type, receiver_id, original_notification_id, idempotency_key, external_id, provider_id, created_at, updated_at, deleted_at, status, "from", provider_data) FROM stdin;
\.


--
-- TOC entry 5221 (class 0 OID 16767)
-- Dependencies: 260
-- Data for Name: notification_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_provider (id, handle, name, is_enabled, channels, created_at, updated_at, deleted_at) FROM stdin;
local	local	local	t	{feed}	2026-03-15 15:08:24.963+00	2026-03-15 15:08:24.963+00	\N
\.


--
-- TOC entry 5222 (class 0 OID 16776)
-- Dependencies: 261
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."order" (id, region_id, display_id, customer_id, version, sales_channel_id, status, is_draft_order, email, currency_code, shipping_address_id, billing_address_id, no_notification, metadata, created_at, updated_at, deleted_at, canceled_at, custom_display_id, locale) FROM stdin;
order_01KMAZ34EK9A4TC2XTR1K28K93	reg_01KKS0NX3SA64NJ3XV501K8DX9	1	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	1	sc_01KKS0NJHVM2S73KTPZF792K8F	pending	f	208017534@qq.com	eur	ordaddr_01KMAZ34EDFT6Q997TWD56TDYY	ordaddr_01KMAZ34ED92X3GM0A12B78511	f	\N	2026-03-22 14:27:26.296+00	2026-03-22 14:27:26.296+00	\N	\N	\N	\N
order_01KMAZMFQPR0YDQBBW2W9WXWEQ	reg_01KKS0NX3SA64NJ3XV501K8DX9	2	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	1	sc_01KKS0NJHVM2S73KTPZF792K8F	pending	f	208017534@qq.com	eur	ordaddr_01KMAZMFQK7S84ZX2QMXPF1AM4	ordaddr_01KMAZMFQKYJNNM1KTYQQFW2FS	f	\N	2026-03-22 14:36:54.905+00	2026-03-22 14:36:54.905+00	\N	\N	\N	\N
order_01KMB0B0MJH078AXV9JSYN46TC	reg_01KKS0NX3SA64NJ3XV501K8DX9	3	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	1	sc_01KKS0NJHVM2S73KTPZF792K8F	pending	f	208017534@qq.com	eur	ordaddr_01KMB0B0ME2BA450PDZQS9CE6S	ordaddr_01KMB0B0ME8SZY1TMBG1MS52JK	f	\N	2026-03-22 14:49:13.11+00	2026-03-22 14:49:13.11+00	\N	\N	\N	\N
order_01KMDPT0TBE3JY8Y27WNS1KTBK	reg_01KKS0NX3SA64NJ3XV501K8DX9	4	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	1	sc_01KKS0NJHVM2S73KTPZF792K8F	pending	f	208017534@qq.com	eur	ordaddr_01KMDPT0T7QWQZF322MW8HJ0CM	ordaddr_01KMDPT0T6AKR1JA875YVE6XJX	f	\N	2026-03-23 16:00:22.35+00	2026-03-23 16:00:22.35+00	\N	\N	\N	\N
order_01KMR318A7BYEGZ5YS4E1YBEXH	reg_01KKS0NX3SA64NJ3XV501K8DX9	5	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	1	sc_01KKS0NJHVM2S73KTPZF792K8F	pending	f	208017534@qq.com	eur	ordaddr_01KMR318A3CPB26TXS5K8TA7TF	ordaddr_01KMR318A2PG9NFK4ZKECC75SS	f	\N	2026-03-27 16:46:26.635+00	2026-03-27 16:46:26.635+00	\N	\N	\N	\N
order_01KMWT7X1RGCE14HQ5YPH2G2BV	reg_01KKS0NX3SA64NJ3XV501K8DX9	6	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	1	sc_01KKS0NJHVM2S73KTPZF792K8F	pending	f	208017534@qq.com	eur	ordaddr_01KMWT7X1N0E9QQM79EGG1X5GE	ordaddr_01KMWT7X1NPAD6TFEKE2HCEC2Y	f	\N	2026-03-29 12:48:59.451+00	2026-03-29 12:48:59.451+00	\N	\N	\N	\N
order_01KMWWKP67JM2ENS5DERPXKPV6	reg_01KKS0NX3SA64NJ3XV501K8DX9	7	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	1	sc_01KKS0NJHVM2S73KTPZF792K8F	pending	f	208017534@qq.com	eur	ordaddr_01KMWWKP63XSA17EJSV3ADB0JQ	ordaddr_01KMWWKP63WCTPZY77ZW5Z62C3	f	\N	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.793+00	\N	\N	\N	\N
order_01KNEVF4EXW0GQDWMBXJJJ6R0W	reg_01KKS0NX3SA64NJ3XV501K8DX9	8	cus_01KKVJHTQJ8HRQQ7JF1327DRG5	1	sc_01KKS0NJHVM2S73KTPZF792K8F	pending	f	208017534@qq.com	eur	ordaddr_01KNEVF4ET8Y3YHDPE4XC77QKF	ordaddr_01KNEVF4ETGNRPVPXT6G0SNHMT	f	\N	2026-04-05 12:56:44.768+00	2026-04-05 12:56:44.768+00	\N	\N	\N	\N
\.


--
-- TOC entry 5223 (class 0 OID 16786)
-- Dependencies: 262
-- Data for Name: order_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_address (id, customer_id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
ordaddr_01KMAZ34ED92X3GM0A12B78511	\N		11	111111	11		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:27:00.633+00	2026-03-22 14:27:00.633+00	\N
ordaddr_01KMAZ34EDFT6Q997TWD56TDYY	\N		11	111111	11		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:27:00.633+00	2026-03-22 14:27:00.633+00	\N
ordaddr_01KMAZMFQKYJNNM1KTYQQFW2FS	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:36:32.077+00	2026-03-22 14:36:32.077+00	\N
ordaddr_01KMAZMFQK7S84ZX2QMXPF1AM4	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:36:32.078+00	2026-03-22 14:36:32.078+00	\N
ordaddr_01KMB0B0ME8SZY1TMBG1MS52JK	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:49:00.518+00	2026-03-22 14:49:00.518+00	\N
ordaddr_01KMB0B0ME2BA450PDZQS9CE6S	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-22 14:49:00.518+00	2026-03-22 14:49:00.518+00	\N
ordaddr_01KMDPT0T6AKR1JA875YVE6XJX	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-23 16:00:00.973+00	2026-03-23 16:00:00.973+00	\N
ordaddr_01KMDPT0T7QWQZF322MW8HJ0CM	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-23 16:00:00.973+00	2026-03-23 16:00:00.973+00	\N
ordaddr_01KMR318A2PG9NFK4ZKECC75SS	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-27 16:46:15.045+00	2026-03-27 16:46:15.045+00	\N
ordaddr_01KMR318A3CPB26TXS5K8TA7TF	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-27 16:46:15.045+00	2026-03-27 16:46:15.045+00	\N
ordaddr_01KMWT7X1NPAD6TFEKE2HCEC2Y	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-29 12:48:49.244+00	2026-03-29 12:48:49.244+00	\N
ordaddr_01KMWT7X1N0E9QQM79EGG1X5GE	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-29 12:48:49.244+00	2026-03-29 12:48:49.244+00	\N
ordaddr_01KMWWKP63WCTPZY77ZW5Z62C3	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-29 13:30:11.013+00	2026-03-29 13:30:11.013+00	\N
ordaddr_01KMWWKP63XSA17EJSV3ADB0JQ	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	15521509168	\N	2026-03-29 13:30:11.013+00	2026-03-29 13:30:11.013+00	\N
ordaddr_01KNEVF4ETGNRPVPXT6G0SNHMT	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	+8615521509168	\N	2026-04-05 12:56:35.099+00	2026-04-05 12:56:35.099+00	\N
ordaddr_01KNEVF4ET8Y3YHDPE4XC77QKF	\N		志强	林	福建省莆田市秀屿区东峤镇上塘村		莆田	dk	福建	351100	+8615521509168	\N	2026-04-05 12:56:35.099+00	2026-04-05 12:56:35.099+00	\N
\.


--
-- TOC entry 5224 (class 0 OID 16793)
-- Dependencies: 263
-- Data for Name: order_cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_cart (order_id, cart_id, id, created_at, updated_at, deleted_at) FROM stdin;
order_01KMAZ34EK9A4TC2XTR1K28K93	cart_01KKS1R0050PJXJ364HE75Y4CS	ordercart_01KMAZ34M5JYBGN31BAAZ8H3Z9	2026-03-22 14:27:26.469296+00	2026-03-22 14:27:26.469296+00	\N
order_01KMAZMFQPR0YDQBBW2W9WXWEQ	cart_01KMAZK68JFQ2E21M85J9A5J15	ordercart_01KMAZMFVVXPSTG3B5W9TFC943	2026-03-22 14:36:55.033695+00	2026-03-22 14:36:55.033695+00	\N
order_01KMB0B0MJH078AXV9JSYN46TC	cart_01KMB09VNMJS6MQ7BRN6FVPKF6	ordercart_01KMB0B0RDK5PEM5VF3A11BZ81	2026-03-22 14:49:13.228968+00	2026-03-22 14:49:13.228968+00	\N
order_01KMDPT0TBE3JY8Y27WNS1KTBK	cart_01KMDPRJQB7VK9882W9CSPS678	ordercart_01KMDPT0Z53DKVE8FJBVR2BCAS	2026-03-23 16:00:22.501729+00	2026-03-23 16:00:22.501729+00	\N
order_01KMR318A7BYEGZ5YS4E1YBEXH	cart_01KMR2XNBGXJPW3G3TF7GW9R96	ordercart_01KMR318EP4A6EGN7B4T2919G3	2026-03-27 16:46:26.76782+00	2026-03-27 16:46:26.76782+00	\N
order_01KMWT7X1RGCE14HQ5YPH2G2BV	cart_01KMWSQ4JZ55YT9T7ZGF1B8SJS	ordercart_01KMWT7X5R1BJS58WNVVD4KHNW	2026-03-29 12:48:59.568947+00	2026-03-29 12:48:59.568947+00	\N
order_01KMWWKP67JM2ENS5DERPXKPV6	cart_01KMWVXRVNRVBCFJEPFX7HXE5C	ordercart_01KMWWKPB4ANCHGN1B6YERN8YP	2026-03-29 13:30:22.939454+00	2026-03-29 13:30:22.939454+00	\N
order_01KNEVF4EXW0GQDWMBXJJJ6R0W	cart_01KNEVD39HAY1ZCPQ4QNZ48EB4	ordercart_01KNEVF4J1X1JJTKEVFW0RPY1Z	2026-04-05 12:56:44.864858+00	2026-04-05 12:56:44.864858+00	\N
\.


--
-- TOC entry 5225 (class 0 OID 16800)
-- Dependencies: 264
-- Data for Name: order_change; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_change (id, order_id, version, description, status, internal_note, created_by, requested_by, requested_at, confirmed_by, confirmed_at, declined_by, declined_reason, metadata, declined_at, canceled_by, canceled_at, created_at, updated_at, change_type, deleted_at, return_id, claim_id, exchange_id, carry_over_promotions) FROM stdin;
\.


--
-- TOC entry 5226 (class 0 OID 16809)
-- Dependencies: 265
-- Data for Name: order_change_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_change_action (id, order_id, version, ordering, order_change_id, reference, reference_id, action, details, amount, raw_amount, internal_note, applied, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- TOC entry 5228 (class 0 OID 16818)
-- Dependencies: 267
-- Data for Name: order_claim; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_claim (id, order_id, return_id, order_version, display_id, type, no_notification, refund_amount, raw_refund_amount, metadata, created_at, updated_at, deleted_at, canceled_at, created_by) FROM stdin;
\.


--
-- TOC entry 5230 (class 0 OID 16826)
-- Dependencies: 269
-- Data for Name: order_claim_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_claim_item (id, claim_id, item_id, is_additional_item, reason, quantity, raw_quantity, note, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5231 (class 0 OID 16834)
-- Dependencies: 270
-- Data for Name: order_claim_item_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_claim_item_image (id, claim_item_id, url, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5232 (class 0 OID 16841)
-- Dependencies: 271
-- Data for Name: order_credit_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_credit_line (id, order_id, reference, reference_id, amount, raw_amount, metadata, created_at, updated_at, deleted_at, version) FROM stdin;
\.


--
-- TOC entry 5234 (class 0 OID 16850)
-- Dependencies: 273
-- Data for Name: order_exchange; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_exchange (id, order_id, return_id, order_version, display_id, no_notification, allow_backorder, difference_due, raw_difference_due, metadata, created_at, updated_at, deleted_at, canceled_at, created_by) FROM stdin;
\.


--
-- TOC entry 5236 (class 0 OID 16859)
-- Dependencies: 275
-- Data for Name: order_exchange_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_exchange_item (id, exchange_id, item_id, quantity, raw_quantity, note, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5237 (class 0 OID 16866)
-- Dependencies: 276
-- Data for Name: order_fulfillment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_fulfillment (order_id, fulfillment_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5238 (class 0 OID 16873)
-- Dependencies: 277
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item (id, order_id, version, item_id, quantity, raw_quantity, fulfilled_quantity, raw_fulfilled_quantity, shipped_quantity, raw_shipped_quantity, return_requested_quantity, raw_return_requested_quantity, return_received_quantity, raw_return_received_quantity, return_dismissed_quantity, raw_return_dismissed_quantity, written_off_quantity, raw_written_off_quantity, metadata, created_at, updated_at, deleted_at, delivered_quantity, raw_delivered_quantity, unit_price, raw_unit_price, compare_at_unit_price, raw_compare_at_unit_price) FROM stdin;
orditem_01KMAZ34EP0DKQMQT8G34P8XAK	order_01KMAZ34EK9A4TC2XTR1K28K93	1	ordli_01KMAZ34EMJB2FB9Q5N3XFH68W	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-22 14:27:26.296+00	2026-03-22 14:27:26.296+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMAZ34EQGTTM5V2AA4YQFGQP	order_01KMAZ34EK9A4TC2XTR1K28K93	1	ordli_01KMAZ34ENCS1EA033KTBFHNYA	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-22 14:27:26.297+00	2026-03-22 14:27:26.297+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMAZMFQRS17KY6C6XBG01DH1	order_01KMAZMFQPR0YDQBBW2W9WXWEQ	1	ordli_01KMAZMFQRPHK9CBPBJ7W0RD4G	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-22 14:36:54.905+00	2026-03-22 14:36:54.906+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMB0B0MNWWTSDZ9EWJP1DA6Y	order_01KMB0B0MJH078AXV9JSYN46TC	1	ordli_01KMB0B0MM5AYZWVKQAT6SV5A8	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-22 14:49:13.11+00	2026-03-22 14:49:13.11+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMDPT0TDTH4ARR8DAAWT3VWP	order_01KMDPT0TBE3JY8Y27WNS1KTBK	1	ordli_01KMDPT0TDM9852KNYSKPRV01Y	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-23 16:00:22.351+00	2026-03-23 16:00:22.351+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMR318AA4X362X01F6EYPZBY	order_01KMR318A7BYEGZ5YS4E1YBEXH	1	ordli_01KMR318AAQDRJNKNDANTS7Y6N	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-27 16:46:26.636+00	2026-03-27 16:46:26.636+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMWT7X1THP58RW4KFVJF6TBD	order_01KMWT7X1RGCE14HQ5YPH2G2BV	1	ordli_01KMWT7X1TT326EMH3KH10P3GE	8	{"value": "8", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-29 12:48:59.452+00	2026-03-29 12:48:59.452+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMWWKP68P9T24R5KS69ZJTBJ	order_01KMWWKP67JM2ENS5DERPXKPV6	1	ordli_01KMWWKP67Z4YKC5X2VS44DEWX	8	{"value": "8", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.793+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMWWKP68FCVZ4DXC5Z00CYP2	order_01KMWWKP67JM2ENS5DERPXKPV6	1	ordli_01KMWWKP68E5SV532JY36E0GP8	6	{"value": "6", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.793+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMWWKP68JZNCS8FZT8DWQ704	order_01KMWWKP67JM2ENS5DERPXKPV6	1	ordli_01KMWWKP68KZ3CYKNPCYRKR82N	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.793+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KMWWKP69GA3PBC4H2KKJ7Y83	order_01KMWWKP67JM2ENS5DERPXKPV6	1	ordli_01KMWWKP68HWEQVVHFFDVPYXJ8	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.793+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KNEVF4EZZ8WJYR5KAVYB8FY7	order_01KNEVF4EXW0GQDWMBXJJJ6R0W	1	ordli_01KNEVF4EY0GJXSE1GJFWB51BC	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-04-05 12:56:44.769+00	2026-04-05 12:56:44.769+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
orditem_01KNEVF4EZB61JGBY943BNC7Y7	order_01KNEVF4EXW0GQDWMBXJJJ6R0W	1	ordli_01KNEVF4EZSYEND0PW1PYXSBER	1	{"value": "1", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	\N	2026-04-05 12:56:44.769+00	2026-04-05 12:56:44.769+00	\N	0	{"value": "0", "precision": 20}	\N	\N	\N	\N
\.


--
-- TOC entry 5239 (class 0 OID 16888)
-- Dependencies: 278
-- Data for Name: order_line_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_line_item (id, totals_id, title, subtitle, thumbnail, variant_id, product_id, product_title, product_description, product_subtitle, product_type, product_collection, product_handle, variant_sku, variant_barcode, variant_title, variant_option_values, requires_shipping, is_discountable, is_tax_inclusive, compare_at_unit_price, raw_compare_at_unit_price, unit_price, raw_unit_price, metadata, created_at, updated_at, deleted_at, is_custom_price, product_type_id, is_giftcard) FROM stdin;
ordli_01KMAZ34EMJB2FB9Q5N3XFH68W	\N	Medusa Sweatshirt	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-22 14:27:26.296+00	2026-03-22 14:27:26.296+00	\N	f	\N	f
ordli_01KMAZ34ENCS1EA033KTBFHNYA	\N	Medusa T-Shirt	L / Black	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png	variant_01KKS0NXJ1BMX9E4QRGE1S4RTA	prod_01KKS0NXERW0SFT7YBHB0PQDC4	Medusa T-Shirt	Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.	\N	\N	\N	t-shirt	SHIRT-L-BLACK	\N	L / Black	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-22 14:27:26.296+00	2026-03-22 14:27:26.296+00	\N	f	\N	f
ordli_01KMAZMFQRPHK9CBPBJ7W0RD4G	\N	Medusa T-Shirt	L / Black	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png	variant_01KKS0NXJ1BMX9E4QRGE1S4RTA	prod_01KKS0NXERW0SFT7YBHB0PQDC4	Medusa T-Shirt	Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.	\N	\N	\N	t-shirt	SHIRT-L-BLACK	\N	L / Black	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-22 14:36:54.905+00	2026-03-22 14:36:54.905+00	\N	f	\N	f
ordli_01KMB0B0MM5AYZWVKQAT6SV5A8	\N	Medusa T-Shirt	M / Black	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png	variant_01KKS0NXJ1F47FMGMDEN317W58	prod_01KKS0NXERW0SFT7YBHB0PQDC4	Medusa T-Shirt	Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.	\N	\N	\N	t-shirt	SHIRT-M-BLACK	\N	M / Black	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-22 14:49:13.11+00	2026-03-22 14:49:13.11+00	\N	f	\N	f
ordli_01KMDPT0TDM9852KNYSKPRV01Y	\N	Medusa Sweatshirt	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-23 16:00:22.351+00	2026-03-23 16:00:22.351+00	\N	f	\N	f
ordli_01KMR318AAQDRJNKNDANTS7Y6N	\N	Medusa Sweatshirt	M	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	variant_01KKS0NXJ3TDJEKQ0X293Y4TDA	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-M	\N	M	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-27 16:46:26.635+00	2026-03-27 16:46:26.635+00	\N	f	\N	f
ordli_01KMWT7X1TT326EMH3KH10P3GE	\N	Medusa Sweatshirt	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 12:48:59.451+00	2026-03-29 12:48:59.451+00	\N	f	\N	f
ordli_01KMWWKP67Z4YKC5X2VS44DEWX	\N	Medusa Sweatshirt	L	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-L	\N	L	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.793+00	\N	f	\N	f
ordli_01KMWWKP68E5SV532JY36E0GP8	\N	Medusa Sweatpants	XL	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	variant_01KKS0NXJ49QMTV0RV35JPNKJK	prod_01KKS0NXER6GCXWSYYHDT5E9TE	Medusa Sweatpants	<h1><strong>About this item</strong></h1><ul><li><p><span style="color: rgb(15, 17, 17);">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span></p></li><li><p><span style="color: rgb(15, 17, 17);">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color: rgb(15, 17, 17);">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	1111	\N	\N	sweatpants	SWEATPANTS-XL	\N	XL	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.793+00	\N	f	\N	f
ordli_01KMWWKP68KZ3CYKNPCYRKR82N	\N	Medusa Sweatpants	S	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	variant_01KKS0NXJ35DQKSZNNGW9DQPZR	prod_01KKS0NXER6GCXWSYYHDT5E9TE	Medusa Sweatpants	<h1><strong>About this item</strong></h1><ul><li><p><span style="color: rgb(15, 17, 17);">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span></p></li><li><p><span style="color: rgb(15, 17, 17);">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color: rgb(15, 17, 17);">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	1111	\N	\N	sweatpants	SWEATPANTS-S	\N	S	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.793+00	\N	f	\N	f
ordli_01KMWWKP68HWEQVVHFFDVPYXJ8	\N	Medusa Sweatpants	M	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	variant_01KKS0NXJ45CN25Z2Y5BH8R3Y1	prod_01KKS0NXER6GCXWSYYHDT5E9TE	Medusa Sweatpants	<h1><strong>About this item</strong></h1><ul><li><p><span style="color: rgb(15, 17, 17);">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span></p></li><li><p><span style="color: rgb(15, 17, 17);">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color: rgb(15, 17, 17);">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	1111	\N	\N	sweatpants	SWEATPANTS-M	\N	M	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.793+00	\N	f	\N	f
ordli_01KNEVF4EY0GJXSE1GJFWB51BC	\N	Medusa Sweatshirt	S	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	variant_01KKS0NXJ3G9VBA54CADHC4PFY	prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-S	\N	S	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-04-05 12:56:44.769+00	2026-04-05 12:56:44.769+00	\N	f	\N	f
ordli_01KNEVF4EZSYEND0PW1PYXSBER	\N	Medusa Shorts	S	https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png	variant_01KKS0NXJ468WFHB5JPG46TJHJ	prod_01KKS0NXERTEZQTGVZJHWQQM2A	Medusa Shorts	Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.	\N	\N	\N	shorts	SHORTS-S	\N	S	\N	t	t	f	\N	\N	10	{"value": "10", "precision": 20}	{}	2026-04-05 12:56:44.769+00	2026-04-05 12:56:44.769+00	\N	f	\N	f
\.


--
-- TOC entry 5240 (class 0 OID 16900)
-- Dependencies: 279
-- Data for Name: order_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_line_item_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, created_at, updated_at, item_id, deleted_at, is_tax_inclusive, version) FROM stdin;
\.


--
-- TOC entry 5241 (class 0 OID 16909)
-- Dependencies: 280
-- Data for Name: order_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_line_item_tax_line (id, description, tax_rate_id, code, rate, raw_rate, provider_id, created_at, updated_at, item_id, deleted_at) FROM stdin;
\.


--
-- TOC entry 5242 (class 0 OID 16916)
-- Dependencies: 281
-- Data for Name: order_payment_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_payment_collection (order_id, payment_collection_id, id, created_at, updated_at, deleted_at) FROM stdin;
order_01KMAZ34EK9A4TC2XTR1K28K93	pay_col_01KMAZ2ZTSYMN61B0QXH7ZZY6Q	ordpay_01KMAZ34MDEPWYQNZXJFV3A7V0	2026-03-22 14:27:26.469483+00	2026-03-22 14:27:26.469483+00	\N
order_01KMAZMFQPR0YDQBBW2W9WXWEQ	pay_col_01KMAZM7SETP0NZRCZN9BB8RTM	ordpay_01KMAZMFW88XZCGZAKJC1ZGBG5	2026-03-22 14:36:55.033791+00	2026-03-22 14:36:55.033791+00	\N
order_01KMB0B0MJH078AXV9JSYN46TC	pay_col_01KMB0AVVC5RX6099VY08HBJNP	ordpay_01KMB0B0RJA1GK9EDW3K6Q5CTE	2026-03-22 14:49:13.229085+00	2026-03-22 14:49:13.229085+00	\N
order_01KMDPT0TBE3JY8Y27WNS1KTBK	pay_col_01KMDPSW75Y3ZXZH7SVG1FZJ9S	ordpay_01KMDPT0ZEFQXSMW0V4WMYC4N3	2026-03-23 16:00:22.501815+00	2026-03-23 16:00:22.501815+00	\N
order_01KMR318A7BYEGZ5YS4E1YBEXH	pay_col_01KMR314RXMEDDRA79EKVW27MQ	ordpay_01KMR318EQ7YJW27BE24TRZZP1	2026-03-27 16:46:26.768013+00	2026-03-27 16:46:26.768013+00	\N
order_01KMWT7X1RGCE14HQ5YPH2G2BV	pay_col_01KMWT7RPYTXTTGDR208M3K1YZ	ordpay_01KMWT7X5W96RH5MW9KZ8SBQ4G	2026-03-29 12:48:59.569009+00	2026-03-29 12:48:59.569009+00	\N
order_01KMWWKP67JM2ENS5DERPXKPV6	pay_col_01KMWWKKKNCEVCT943959Q63R4	ordpay_01KMWWKPBATX6KY01W8ECMSNXZ	2026-03-29 13:30:22.939592+00	2026-03-29 13:30:22.939592+00	\N
order_01KNEVF4EXW0GQDWMBXJJJ6R0W	pay_col_01KNEVF2CB25F0V0R409SP04B8	ordpay_01KNEVF4J3VNMDE5CKHZWQWGA5	2026-04-05 12:56:44.864626+00	2026-04-05 12:56:44.864626+00	\N
\.


--
-- TOC entry 5243 (class 0 OID 16923)
-- Dependencies: 282
-- Data for Name: order_promotion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_promotion (order_id, promotion_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5244 (class 0 OID 16930)
-- Dependencies: 283
-- Data for Name: order_shipping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping (id, order_id, version, shipping_method_id, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
ordspmv_01KMAZ34EJR8MMKWV2W3VQ1BPP	order_01KMAZ34EK9A4TC2XTR1K28K93	1	ordsm_01KMAZ34EJTRPDVG6QFSE24F4V	2026-03-22 14:27:26.297+00	2026-03-22 14:27:26.297+00	\N	\N	\N	\N
ordspmv_01KMAZMFQPW82250C5R00VGJ8F	order_01KMAZMFQPR0YDQBBW2W9WXWEQ	1	ordsm_01KMAZMFQPJD4EJEHHV49DFW43	2026-03-22 14:36:54.906+00	2026-03-22 14:36:54.906+00	\N	\N	\N	\N
ordspmv_01KMB0B0MJ7X0MJXDA7ZQQXN3E	order_01KMB0B0MJH078AXV9JSYN46TC	1	ordsm_01KMB0B0MJY10ZH59DG6334CZM	2026-03-22 14:49:13.111+00	2026-03-22 14:49:13.111+00	\N	\N	\N	\N
ordspmv_01KMDPT0TBGS2P3GEGY8XZKJJA	order_01KMDPT0TBE3JY8Y27WNS1KTBK	1	ordsm_01KMDPT0TB5RNR9PZAK12XAGYC	2026-03-23 16:00:22.352+00	2026-03-23 16:00:22.352+00	\N	\N	\N	\N
ordspmv_01KMR318A7Y6C19NV2VSK8V6J6	order_01KMR318A7BYEGZ5YS4E1YBEXH	1	ordsm_01KMR318A647ANYAAHXP82PK9S	2026-03-27 16:46:26.637+00	2026-03-27 16:46:26.637+00	\N	\N	\N	\N
ordspmv_01KMWT7X1R489A08EXP5E02KVR	order_01KMWT7X1RGCE14HQ5YPH2G2BV	1	ordsm_01KMWT7X1RHY4FGD66K9CGNZZA	2026-03-29 12:48:59.453+00	2026-03-29 12:48:59.453+00	\N	\N	\N	\N
ordspmv_01KMWWKP670EWE90P8PG79BRKD	order_01KMWWKP67JM2ENS5DERPXKPV6	1	ordsm_01KMWWKP67WFGYT0WP2ZE03QZY	2026-03-29 13:30:22.794+00	2026-03-29 13:30:22.794+00	\N	\N	\N	\N
ordspmv_01KNEVF4EXPHDRAAZVY8P8HJTS	order_01KNEVF4EXW0GQDWMBXJJJ6R0W	1	ordsm_01KNEVF4EXWPDT33XD52CXEADM	2026-04-05 12:56:44.77+00	2026-04-05 12:56:44.77+00	\N	\N	\N	\N
\.


--
-- TOC entry 5245 (class 0 OID 16937)
-- Dependencies: 284
-- Data for Name: order_shipping_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping_method (id, name, description, amount, raw_amount, is_tax_inclusive, shipping_option_id, data, metadata, created_at, updated_at, deleted_at, is_custom_amount) FROM stdin;
ordsm_01KMAZ34EJTRPDVG6QFSE24F4V	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-22 14:27:26.297+00	2026-03-22 14:27:26.297+00	\N	f
ordsm_01KMAZMFQPJD4EJEHHV49DFW43	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-22 14:36:54.906+00	2026-03-22 14:36:54.906+00	\N	f
ordsm_01KMB0B0MJY10ZH59DG6334CZM	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-22 14:49:13.111+00	2026-03-22 14:49:13.111+00	\N	f
ordsm_01KMDPT0TB5RNR9PZAK12XAGYC	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-23 16:00:22.352+00	2026-03-23 16:00:22.352+00	\N	f
ordsm_01KMR318A647ANYAAHXP82PK9S	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-27 16:46:26.636+00	2026-03-27 16:46:26.637+00	\N	f
ordsm_01KMWT7X1RHY4FGD66K9CGNZZA	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-29 12:48:59.452+00	2026-03-29 12:48:59.452+00	\N	f
ordsm_01KMWWKP67WFGYT0WP2ZE03QZY	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-03-29 13:30:22.794+00	2026-03-29 13:30:22.794+00	\N	f
ordsm_01KNEVF4EXWPDT33XD52CXEADM	Standard Shipping	\N	10	{"value": "10", "precision": 20}	f	so_01KKS0NXAAGF840G2QZAQZNA4P	{}	\N	2026-04-05 12:56:44.77+00	2026-04-05 12:56:44.77+00	\N	f
\.


--
-- TOC entry 5246 (class 0 OID 16946)
-- Dependencies: 285
-- Data for Name: order_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping_method_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, created_at, updated_at, shipping_method_id, deleted_at) FROM stdin;
\.


--
-- TOC entry 5247 (class 0 OID 16953)
-- Dependencies: 286
-- Data for Name: order_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping_method_tax_line (id, description, tax_rate_id, code, rate, raw_rate, provider_id, created_at, updated_at, shipping_method_id, deleted_at) FROM stdin;
\.


--
-- TOC entry 5248 (class 0 OID 16960)
-- Dependencies: 287
-- Data for Name: order_summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_summary (id, order_id, version, totals, created_at, updated_at, deleted_at) FROM stdin;
ordsum_01KMAZ34EG0RFTA9GVSA5VSA0T	order_01KMAZ34EK9A4TC2XTR1K28K93	1	{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 30, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 30, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 30, "original_order_total": 30, "raw_accounting_total": {"value": "30", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "30", "precision": 20}, "raw_current_order_total": {"value": "30", "precision": 20}, "raw_original_order_total": {"value": "30", "precision": 20}}	2026-03-22 14:27:26.297+00	2026-03-22 14:27:26.297+00	\N
ordsum_01KMAZMFQN17MPHS6Y1P8F0NA3	order_01KMAZMFQPR0YDQBBW2W9WXWEQ	1	{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 20, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 20, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 20, "original_order_total": 20, "raw_accounting_total": {"value": "20", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "20", "precision": 20}, "raw_current_order_total": {"value": "20", "precision": 20}, "raw_original_order_total": {"value": "20", "precision": 20}}	2026-03-22 14:36:54.906+00	2026-03-22 14:36:54.906+00	\N
ordsum_01KMB0B0MH8QE4KQPMFN51BYSB	order_01KMB0B0MJH078AXV9JSYN46TC	1	{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 20, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 20, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 20, "original_order_total": 20, "raw_accounting_total": {"value": "20", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "20", "precision": 20}, "raw_current_order_total": {"value": "20", "precision": 20}, "raw_original_order_total": {"value": "20", "precision": 20}}	2026-03-22 14:49:13.111+00	2026-03-22 14:49:13.111+00	\N
ordsum_01KMDPT0TA23DYPC3R034M7BYZ	order_01KMDPT0TBE3JY8Y27WNS1KTBK	1	{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 20, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 20, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 20, "original_order_total": 20, "raw_accounting_total": {"value": "20", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "20", "precision": 20}, "raw_current_order_total": {"value": "20", "precision": 20}, "raw_original_order_total": {"value": "20", "precision": 20}}	2026-03-23 16:00:22.352+00	2026-03-23 16:00:22.352+00	\N
ordsum_01KMR318A51VV3X7Q90ZQ8ZX9H	order_01KMR318A7BYEGZ5YS4E1YBEXH	1	{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 20, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 20, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 20, "original_order_total": 20, "raw_accounting_total": {"value": "20", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "20", "precision": 20}, "raw_current_order_total": {"value": "20", "precision": 20}, "raw_original_order_total": {"value": "20", "precision": 20}}	2026-03-27 16:46:26.636+00	2026-03-27 16:46:26.636+00	\N
ordsum_01KMWT7X1RR4MC3KKR6VMJ9XBM	order_01KMWT7X1RGCE14HQ5YPH2G2BV	1	{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 90, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 90, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 90, "original_order_total": 90, "raw_accounting_total": {"value": "90", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "90", "precision": 20}, "raw_current_order_total": {"value": "90", "precision": 20}, "raw_original_order_total": {"value": "90", "precision": 20}}	2026-03-29 12:48:59.452+00	2026-03-29 12:48:59.452+00	\N
ordsum_01KMWWKP660ZX4TC9PNRN0GH1P	order_01KMWWKP67JM2ENS5DERPXKPV6	1	{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 170, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 170, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 170, "original_order_total": 170, "raw_accounting_total": {"value": "170", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "170", "precision": 20}, "raw_current_order_total": {"value": "170", "precision": 20}, "raw_original_order_total": {"value": "170", "precision": 20}}	2026-03-29 13:30:22.793+00	2026-03-29 13:30:22.794+00	\N
ordsum_01KNEVF4EW9K3PWVHS3PK129Y2	order_01KNEVF4EXW0GQDWMBXJJJ6R0W	1	{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 30, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 30, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 30, "original_order_total": 30, "raw_accounting_total": {"value": "30", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "30", "precision": 20}, "raw_current_order_total": {"value": "30", "precision": 20}, "raw_original_order_total": {"value": "30", "precision": 20}}	2026-04-05 12:56:44.769+00	2026-04-05 12:56:44.769+00	\N
\.


--
-- TOC entry 5249 (class 0 OID 16968)
-- Dependencies: 288
-- Data for Name: order_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_transaction (id, order_id, version, amount, raw_amount, currency_code, reference, reference_id, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- TOC entry 5250 (class 0 OID 16976)
-- Dependencies: 289
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment (id, amount, raw_amount, currency_code, provider_id, data, created_at, updated_at, deleted_at, captured_at, canceled_at, payment_collection_id, payment_session_id, metadata) FROM stdin;
pay_01KMAZ34NK718Y6WQ3EVNJCDEH	30	{"value": "30", "precision": 20}	eur	pp_system_default	{}	2026-03-22 14:27:26.515+00	2026-03-22 14:27:26.515+00	\N	\N	\N	pay_col_01KMAZ2ZTSYMN61B0QXH7ZZY6Q	payses_01KMAZ2ZWWS09Z4Q598W0RZG5A	\N
pay_01KMAZMFYNVHKVA7Z96C2668VQ	20	{"value": "20", "precision": 20}	eur	pp_system_default	{}	2026-03-22 14:36:55.126+00	2026-03-22 14:36:55.126+00	\N	\N	\N	pay_col_01KMAZM7SETP0NZRCZN9BB8RTM	payses_01KMAZM7W4HFJMJZ1V75FCJB3P	\N
pay_01KMB0B0T4Q9FP2GC4JFH79BY8	20	{"value": "20", "precision": 20}	eur	pp_system_default	{}	2026-03-22 14:49:13.285+00	2026-03-22 14:49:13.285+00	\N	\N	\N	pay_col_01KMB0AVVC5RX6099VY08HBJNP	payses_01KMB0AVXP2MQW4SBNEZX51XVE	\N
pay_01KMDPT110ACFAZBRW86CE2T4Z	20	{"value": "20", "precision": 20}	eur	pp_system_default	{}	2026-03-23 16:00:22.56+00	2026-03-23 16:00:22.56+00	\N	\N	\N	pay_col_01KMDPSW75Y3ZXZH7SVG1FZJ9S	payses_01KMDPSW9PKSCWC832XB09PYSQ	\N
pay_01KMR318G7WP9GANRRENJ6H85E	20	{"value": "20", "precision": 20}	eur	pp_system_default	{}	2026-03-27 16:46:26.824+00	2026-03-27 16:46:26.824+00	\N	\N	\N	pay_col_01KMR314RXMEDDRA79EKVW27MQ	payses_01KMR314VG7TW4N07Q5RK39AHG	\N
pay_01KMWT7X7CZTV5043DDZH2977P	90	{"value": "90", "precision": 20}	eur	pp_system_default	{}	2026-03-29 12:48:59.628+00	2026-03-29 12:48:59.628+00	\N	\N	\N	pay_col_01KMWT7RPYTXTTGDR208M3K1YZ	payses_01KMWT7RSRF9AZ84D2EX65BNYT	\N
pay_01KMWWKPCTK30Y6KM13SYK1PV0	170	{"value": "170", "precision": 20}	eur	pp_system_default	{}	2026-03-29 13:30:23.003+00	2026-03-29 13:30:23.003+00	\N	\N	\N	pay_col_01KMWWKKKNCEVCT943959Q63R4	payses_01KMWWKKPBB4PJJAKB1KFX53VB	\N
pay_01KNEVF4KT1TXTKW0SX2YQYN8K	30	{"value": "30", "precision": 20}	eur	pp_system_default	{}	2026-04-05 12:56:44.922+00	2026-04-05 12:56:44.922+00	\N	\N	\N	pay_col_01KNEVF2CB25F0V0R409SP04B8	payses_01KNEVF2E5937P90AYH7QB722Q	\N
\.


--
-- TOC entry 5251 (class 0 OID 16983)
-- Dependencies: 290
-- Data for Name: payment_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_collection (id, currency_code, amount, raw_amount, authorized_amount, raw_authorized_amount, captured_amount, raw_captured_amount, refunded_amount, raw_refunded_amount, created_at, updated_at, deleted_at, completed_at, status, metadata) FROM stdin;
pay_col_01KMAZ2ZTSYMN61B0QXH7ZZY6Q	eur	30	{"value": "30", "precision": 20}	30	{"value": "30", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	2026-03-22 14:27:21.562+00	2026-03-22 14:27:26.543+00	\N	\N	authorized	\N
pay_col_01KMAZM7SETP0NZRCZN9BB8RTM	eur	20	{"value": "20", "precision": 20}	20	{"value": "20", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	2026-03-22 14:36:46.766+00	2026-03-22 14:36:55.152+00	\N	\N	authorized	\N
pay_col_01KMB0AVVC5RX6099VY08HBJNP	eur	20	{"value": "20", "precision": 20}	20	{"value": "20", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	2026-03-22 14:49:08.205+00	2026-03-22 14:49:13.329+00	\N	\N	authorized	\N
pay_col_01KMDPSW75Y3ZXZH7SVG1FZJ9S	eur	20	{"value": "20", "precision": 20}	20	{"value": "20", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	2026-03-23 16:00:17.638+00	2026-03-23 16:00:22.589+00	\N	\N	authorized	\N
pay_col_01KMR314RXMEDDRA79EKVW27MQ	eur	20	{"value": "20", "precision": 20}	20	{"value": "20", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	2026-03-27 16:46:23.005+00	2026-03-27 16:46:26.859+00	\N	\N	authorized	\N
pay_col_01KMWT7RPYTXTTGDR208M3K1YZ	eur	90	{"value": "90", "precision": 20}	90	{"value": "90", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	2026-03-29 12:48:55.006+00	2026-03-29 12:48:59.657+00	\N	\N	authorized	\N
pay_col_01KMWWKKKNCEVCT943959Q63R4	eur	170	{"value": "170", "precision": 20}	170	{"value": "170", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	2026-03-29 13:30:20.149+00	2026-03-29 13:30:23.024+00	\N	\N	authorized	\N
pay_col_01KNEVF2CB25F0V0R409SP04B8	eur	30	{"value": "30", "precision": 20}	30	{"value": "30", "precision": 20}	0	{"value": "0", "precision": 20}	0	{"value": "0", "precision": 20}	2026-04-05 12:56:42.635+00	2026-04-05 12:56:44.946+00	\N	\N	authorized	\N
\.


--
-- TOC entry 5252 (class 0 OID 16992)
-- Dependencies: 291
-- Data for Name: payment_collection_payment_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_collection_payment_providers (payment_collection_id, payment_provider_id) FROM stdin;
\.


--
-- TOC entry 5253 (class 0 OID 16997)
-- Dependencies: 292
-- Data for Name: payment_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
pp_system_default	t	2026-03-15 15:08:24.95+00	2026-03-15 15:08:24.95+00	\N
\.


--
-- TOC entry 5254 (class 0 OID 17005)
-- Dependencies: 293
-- Data for Name: payment_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_session (id, currency_code, amount, raw_amount, provider_id, data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
payses_01KMAZ2ZWWS09Z4Q598W0RZG5A	eur	30	{"value": "30", "precision": 20}	pp_system_default	{}	{}	authorized	2026-03-22 14:27:26.509+00	pay_col_01KMAZ2ZTSYMN61B0QXH7ZZY6Q	{}	2026-03-22 14:27:21.629+00	2026-03-22 14:27:26.516+00	\N
payses_01KMAZM7W4HFJMJZ1V75FCJB3P	eur	20	{"value": "20", "precision": 20}	pp_system_default	{}	{"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": []}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}	authorized	2026-03-22 14:36:55.115+00	pay_col_01KMAZM7SETP0NZRCZN9BB8RTM	{}	2026-03-22 14:36:46.852+00	2026-03-22 14:36:55.126+00	\N
payses_01KMB0AVXP2MQW4SBNEZX51XVE	eur	20	{"value": "20", "precision": 20}	pp_system_default	{}	{"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}]}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}	authorized	2026-03-22 14:49:13.276+00	pay_col_01KMB0AVVC5RX6099VY08HBJNP	{}	2026-03-22 14:49:08.279+00	2026-03-22 14:49:13.285+00	\N
payses_01KMDPSW9PKSCWC832XB09PYSQ	eur	20	{"value": "20", "precision": 20}	pp_system_default	{}	{"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}]}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}	authorized	2026-03-23 16:00:22.554+00	pay_col_01KMDPSW75Y3ZXZH7SVG1FZJ9S	{}	2026-03-23 16:00:17.718+00	2026-03-23 16:00:22.561+00	\N
payses_01KMR314VG7TW4N07Q5RK39AHG	eur	20	{"value": "20", "precision": 20}	pp_system_default	{}	{"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [{"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}, {"id": "cuaddr_01KMR2WPG233CNE36V0TEY2T2M", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-03-27T16:43:57.314Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-03-27T16:43:57.314Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}], "billing_address": {"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}	authorized	2026-03-27 16:46:26.82+00	pay_col_01KMR314RXMEDDRA79EKVW27MQ	{}	2026-03-27 16:46:23.089+00	2026-03-27 16:46:26.824+00	\N
payses_01KMWT7RSRF9AZ84D2EX65BNYT	eur	90	{"value": "90", "precision": 20}	pp_system_default	{}	{"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [{"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}, {"id": "cuaddr_01KMR2WPG233CNE36V0TEY2T2M", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-03-27T16:43:57.314Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-03-27T16:43:57.314Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}], "billing_address": {"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}	authorized	2026-03-29 12:48:59.619+00	pay_col_01KMWT7RPYTXTTGDR208M3K1YZ	{}	2026-03-29 12:48:55.097+00	2026-03-29 12:48:59.629+00	\N
payses_01KMWWKKPBB4PJJAKB1KFX53VB	eur	170	{"value": "170", "precision": 20}	pp_system_default	{}	{"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [{"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}, {"id": "cuaddr_01KMR2WPG233CNE36V0TEY2T2M", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-03-27T16:43:57.314Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-03-27T16:43:57.314Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}], "billing_address": {"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}	authorized	2026-03-29 13:30:22.996+00	pay_col_01KMWWKKKNCEVCT943959Q63R4	{}	2026-03-29 13:30:20.235+00	2026-03-29 13:30:23.003+00	\N
payses_01KNEVF2E5937P90AYH7QB722Q	eur	30	{"value": "30", "precision": 20}	pp_system_default	{}	{"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [{"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}, {"id": "cuaddr_01KMR2WPG233CNE36V0TEY2T2M", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-03-27T16:43:57.314Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-03-27T16:43:57.314Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}], "billing_address": {"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}	authorized	2026-04-05 12:56:44.918+00	pay_col_01KNEVF2CB25F0V0R409SP04B8	{}	2026-04-05 12:56:42.693+00	2026-04-05 12:56:44.923+00	\N
\.


--
-- TOC entry 5255 (class 0 OID 17015)
-- Dependencies: 294
-- Data for Name: price; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price (id, title, price_set_id, currency_code, raw_amount, rules_count, created_at, updated_at, deleted_at, price_list_id, amount, min_quantity, max_quantity, raw_min_quantity, raw_max_quantity) FROM stdin;
price_01KKS0NXB3CFZWF3C2033EQQ18	\N	pset_01KKS0NXB4CEMBZTXSG36XG426	usd	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.406+00	2026-03-15 15:08:50.406+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXB3G2AB9DABJDRZX5JP	\N	pset_01KKS0NXB4CEMBZTXSG36XG426	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.406+00	2026-03-15 15:08:50.406+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXB419VFYVV8ZE8C2KED	\N	pset_01KKS0NXB4CEMBZTXSG36XG426	eur	{"value": "10", "precision": 20}	1	2026-03-15 15:08:50.406+00	2026-03-15 15:08:50.406+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXB44GP6ZVW6RFFXH4G9	\N	pset_01KKS0NXB5YSE6M5SAQ8A95MN5	usd	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.406+00	2026-03-15 15:08:50.406+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXB5KM9RYJ0GYCM47MCR	\N	pset_01KKS0NXB5YSE6M5SAQ8A95MN5	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.406+00	2026-03-15 15:08:50.406+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXB5JPW3M63WWXN6SJX9	\N	pset_01KKS0NXB5YSE6M5SAQ8A95MN5	eur	{"value": "10", "precision": 20}	1	2026-03-15 15:08:50.406+00	2026-03-15 15:08:50.406+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXM98DFXQ1H3Z54V03EX	\N	pset_01KKS0NXM9EZV1NYPK0NDQTEXJ	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXM9RM08W9V551T1HACM	\N	pset_01KKS0NXM9EZV1NYPK0NDQTEXJ	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXM9NWSGM4F0D4RNB0Z3	\N	pset_01KKS0NXM9FCC8CAAX7QRPZZP8	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXM9PS3QC7S7D4JGM0GF	\N	pset_01KKS0NXM9FCC8CAAX7QRPZZP8	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXM9RMZAKVQWC2A021PM	\N	pset_01KKS0NXMABXWC68BJZZ86M2MD	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMA53YRSW9T39XE2495	\N	pset_01KKS0NXMABXWC68BJZZ86M2MD	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMAXXDC5D2XC6TCJ48D	\N	pset_01KKS0NXMATQF244W1C77KV4H4	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMA6HJBGVS42AVZD8P3	\N	pset_01KKS0NXMATQF244W1C77KV4H4	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMA1W93QDF75CK8PVA7	\N	pset_01KKS0NXMAEFA989M4FN4XEX2M	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMA8V4BFGWK1MAJEGZW	\N	pset_01KKS0NXMAEFA989M4FN4XEX2M	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMAF36P5FQSMR0PAHKR	\N	pset_01KKS0NXMAMSAQE8E4SCCX1PQG	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMAC347G5B4JFKCY0GQ	\N	pset_01KKS0NXMAMSAQE8E4SCCX1PQG	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMAQB5RRQ2ABRJWWQY1	\N	pset_01KKS0NXMBCKMAZKHVWEQ38BQR	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMBC7HV2W11C9NTMSNM	\N	pset_01KKS0NXMBCKMAZKHVWEQ38BQR	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMBGM9G01QE7RBFA5W7	\N	pset_01KKS0NXMBYEQFSVBPERMWZTVZ	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMBA5EHWTC5NZSM8BCR	\N	pset_01KKS0NXMBYEQFSVBPERMWZTVZ	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMB2GYHN609B4P69B59	\N	pset_01KKS0NXMB802XZ9GS3965JC4H	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMB3TYCGYY4PC7XY97B	\N	pset_01KKS0NXMB802XZ9GS3965JC4H	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMB2VR5VYS7JN8JWQTJ	\N	pset_01KKS0NXMB64A9X8HNN9DWRYDA	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMBQJRNZ4QRCYVHRPYK	\N	pset_01KKS0NXMB64A9X8HNN9DWRYDA	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMBWHRY2T5Z2V5T44HM	\N	pset_01KKS0NXMCF6EBX2DW9KG2EEYQ	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMCVV2QV5TSXPM4Q1SJ	\N	pset_01KKS0NXMCF6EBX2DW9KG2EEYQ	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMCEMNDQ3706MZHG05C	\N	pset_01KKS0NXMCAA8MPHD0HTXGCGFF	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMCBD9VR5CPMV63C8MF	\N	pset_01KKS0NXMCAA8MPHD0HTXGCGFF	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMCXWM8BVMF8JS67Q9K	\N	pset_01KKS0NXMC055K55B7NTG4ETEY	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMCPMP74HJAJ8DP01Y9	\N	pset_01KKS0NXMC055K55B7NTG4ETEY	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMCD9J325BR1G63K5YV	\N	pset_01KKS0NXMCYDHSHA2KCK65CCY3	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMCDZAGG814A91QJDBW	\N	pset_01KKS0NXMCYDHSHA2KCK65CCY3	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMC8AGETW12HFDBG592	\N	pset_01KKS0NXMDW0A7KVFG5ZWAFBQ4	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMD8D9R3PT022HXT1KJ	\N	pset_01KKS0NXMDW0A7KVFG5ZWAFBQ4	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMDSBEBQ8X1MK1NTY8F	\N	pset_01KKS0NXMDYV852D6TDS23PQ90	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMDM70CK2M3398AM7HV	\N	pset_01KKS0NXMDYV852D6TDS23PQ90	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMD1S055FAXRERVEGXS	\N	pset_01KKS0NXMDTGS07D1AWKZS9M64	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMD9WFDC4FZ4XCJ1WKM	\N	pset_01KKS0NXMDTGS07D1AWKZS9M64	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMDR0Z3JDKJMGJA0KFF	\N	pset_01KKS0NXMD6W04AAV1FS8ZDQN4	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.704+00	2026-03-15 15:08:50.704+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMD619MR39SGZETF254	\N	pset_01KKS0NXMD6W04AAV1FS8ZDQN4	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.704+00	2026-03-15 15:08:50.704+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMD7J90SW51FF33039H	\N	pset_01KKS0NXMEF5E793C5TTM6DK3S	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.704+00	2026-03-15 15:08:50.704+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMENQZ77YSM6Q7N1W6R	\N	pset_01KKS0NXMEF5E793C5TTM6DK3S	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.704+00	2026-03-15 15:08:50.704+00	\N	\N	15	\N	\N	\N	\N
price_01KKS0NXMEB7MBYGT9DW5E8X7V	\N	pset_01KKS0NXME6EGSFBGTRDAWH6XM	eur	{"value": "10", "precision": 20}	0	2026-03-15 15:08:50.704+00	2026-03-15 15:08:50.704+00	\N	\N	10	\N	\N	\N	\N
price_01KKS0NXMENVAZYSCWHN3570AN	\N	pset_01KKS0NXME6EGSFBGTRDAWH6XM	usd	{"value": "15", "precision": 20}	0	2026-03-15 15:08:50.704+00	2026-03-15 15:08:50.704+00	\N	\N	15	\N	\N	\N	\N
\.


--
-- TOC entry 5256 (class 0 OID 17023)
-- Dependencies: 295
-- Data for Name: price_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_list (id, status, starts_at, ends_at, rules_count, title, description, type, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5257 (class 0 OID 17035)
-- Dependencies: 296
-- Data for Name: price_list_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_list_rule (id, price_list_id, created_at, updated_at, deleted_at, value, attribute) FROM stdin;
\.


--
-- TOC entry 5258 (class 0 OID 17043)
-- Dependencies: 297
-- Data for Name: price_preference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_preference (id, attribute, value, is_tax_inclusive, created_at, updated_at, deleted_at) FROM stdin;
prpref_01KKS0NJKC84K6KN8VWGJWNV4E	currency_code	eur	f	2026-03-15 15:08:39.404+00	2026-03-15 15:08:39.404+00	\N
prpref_01KKS0NX5B1M3C43SJP037HFK7	region_id	reg_01KKS0NX3SA64NJ3XV501K8DX9	f	2026-03-15 15:08:50.219+00	2026-03-15 15:08:50.219+00	\N
prpref_01KKVJF1APA7PKKWSTQMMG4BKJ	currency_code	usd	f	2026-03-16 14:58:08.342+00	2026-03-16 14:58:08.342+00	\N
prpref_01KMR2KKFNT6J58HGDAB3SBWZP	region_id	reg_01KMR2KKDP7ZBBVMJJ56BJBR3X	t	2026-03-27 16:38:59.318+00	2026-03-27 16:38:59.318+00	\N
\.


--
-- TOC entry 5259 (class 0 OID 17051)
-- Dependencies: 298
-- Data for Name: price_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_rule (id, value, priority, price_id, created_at, updated_at, deleted_at, attribute, operator) FROM stdin;
prule_01KKS0NXB4KVA43X2GPK39FQ4X	reg_01KKS0NX3SA64NJ3XV501K8DX9	0	price_01KKS0NXB419VFYVV8ZE8C2KED	2026-03-15 15:08:50.406+00	2026-03-15 15:08:50.406+00	\N	region_id	eq
prule_01KKS0NXB55QDW3TVRBHCGM17Q	reg_01KKS0NX3SA64NJ3XV501K8DX9	0	price_01KKS0NXB5JPW3M63WWXN6SJX9	2026-03-15 15:08:50.406+00	2026-03-15 15:08:50.406+00	\N	region_id	eq
\.


--
-- TOC entry 5260 (class 0 OID 17062)
-- Dependencies: 299
-- Data for Name: price_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_set (id, created_at, updated_at, deleted_at) FROM stdin;
pset_01KKS0NXB4CEMBZTXSG36XG426	2026-03-15 15:08:50.405+00	2026-03-15 15:08:50.405+00	\N
pset_01KKS0NXB5YSE6M5SAQ8A95MN5	2026-03-15 15:08:50.406+00	2026-03-15 15:08:50.406+00	\N
pset_01KKS0NXM9EZV1NYPK0NDQTEXJ	2026-03-15 15:08:50.702+00	2026-03-15 15:08:50.702+00	\N
pset_01KKS0NXM9FCC8CAAX7QRPZZP8	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMABXWC68BJZZ86M2MD	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMATQF244W1C77KV4H4	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMAEFA989M4FN4XEX2M	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMAMSAQE8E4SCCX1PQG	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMBCKMAZKHVWEQ38BQR	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMBYEQFSVBPERMWZTVZ	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMB802XZ9GS3965JC4H	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMB64A9X8HNN9DWRYDA	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMCF6EBX2DW9KG2EEYQ	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMCAA8MPHD0HTXGCGFF	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMC055K55B7NTG4ETEY	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMCYDHSHA2KCK65CCY3	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMDW0A7KVFG5ZWAFBQ4	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMDYV852D6TDS23PQ90	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMDTGS07D1AWKZS9M64	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMD6W04AAV1FS8ZDQN4	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXMEF5E793C5TTM6DK3S	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
pset_01KKS0NXME6EGSFBGTRDAWH6XM	2026-03-15 15:08:50.703+00	2026-03-15 15:08:50.703+00	\N
\.


--
-- TOC entry 5261 (class 0 OID 17069)
-- Dependencies: 300
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, title, handle, subtitle, description, is_giftcard, status, thumbnail, weight, length, height, width, origin_country, hs_code, mid_code, material, collection_id, type_id, discountable, external_id, created_at, updated_at, deleted_at, metadata) FROM stdin;
prod_01KKS0NXERTEZQTGVZJHWQQM2A	Medusa Shorts	shorts	\N	Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.	f	published	https://admin.wolzq.com/uploads/1775407172882-course3.jpeg	400	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-03-15 15:08:50.529+00	2026-04-05 16:39:33.195+00	\N	\N
prod_01KKS0NXERW0SFT7YBHB0PQDC4	Medusa T-Shirt	t-shirt	\N	Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.	f	published	https://admin.wolzq.com/uploads/1775407196734-course4.jpeg	400	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-03-15 15:08:50.528+00	2026-04-05 16:39:57.005+00	\N	{"course_id": "course_demo_1"}
prod_01KKS0NXER8KYP7V0W4MVZXJGB	Medusa Sweatshirt	sweatshirt	\N	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	f	published	https://admin.wolzq.com/uploads/1775407132845-course2.jpeg	400	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-03-15 15:08:50.529+00	2026-04-05 16:40:35.116+00	\N	{"course_id": "course_demo_2"}
prod_01KKS0NXER6GCXWSYYHDT5E9TE	Medusa Sweatpants	sweatpants	1111	<h1><strong>About this item</strong></h1><ul><li><p><span style="color: rgb(15, 17, 17);">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span></p></li><li><p><span style="color: rgb(15, 17, 17);">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color: rgb(15, 17, 17);">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	f	published	https://admin.wolzq.com/uploads/1775407082606-course1.jpeg	400	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-03-15 15:08:50.529+00	2026-04-05 16:40:18.571+00	\N	{"course_id": "course-demo-3"}
\.


--
-- TOC entry 5262 (class 0 OID 17080)
-- Dependencies: 301
-- Data for Name: product_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at, deleted_at, metadata) FROM stdin;
pcat_01KKS0NXE5SGBSZV7183FEN0WJ	Shirts		shirts	pcat_01KKS0NXE5SGBSZV7183FEN0WJ	t	f	0	\N	2026-03-15 15:08:50.503+00	2026-03-15 15:08:50.503+00	\N	\N
pcat_01KKS0NXE63N35PEMF6AP6A9KT	Sweatshirts		sweatshirts	pcat_01KKS0NXE63N35PEMF6AP6A9KT	t	f	1	\N	2026-03-15 15:08:50.503+00	2026-03-15 15:08:50.503+00	\N	\N
pcat_01KKS0NXE6926JHD024JN7AGQ7	Pants		pants	pcat_01KKS0NXE6926JHD024JN7AGQ7	t	f	2	\N	2026-03-15 15:08:50.503+00	2026-03-15 15:08:50.503+00	\N	\N
pcat_01KKS0NXE761S0KVQ1ZS5BN3QH	Merch		merch	pcat_01KKS0NXE761S0KVQ1ZS5BN3QH	t	f	3	\N	2026-03-15 15:08:50.503+00	2026-03-15 15:08:50.503+00	\N	\N
\.


--
-- TOC entry 5263 (class 0 OID 17091)
-- Dependencies: 302
-- Data for Name: product_category_product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_category_product (product_id, product_category_id) FROM stdin;
prod_01KKS0NXERW0SFT7YBHB0PQDC4	pcat_01KKS0NXE5SGBSZV7183FEN0WJ
prod_01KKS0NXER8KYP7V0W4MVZXJGB	pcat_01KKS0NXE63N35PEMF6AP6A9KT
prod_01KKS0NXER6GCXWSYYHDT5E9TE	pcat_01KKS0NXE6926JHD024JN7AGQ7
prod_01KKS0NXERTEZQTGVZJHWQQM2A	pcat_01KKS0NXE761S0KVQ1ZS5BN3QH
\.


--
-- TOC entry 5264 (class 0 OID 17096)
-- Dependencies: 303
-- Data for Name: product_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_collection (id, title, handle, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5265 (class 0 OID 17103)
-- Dependencies: 304
-- Data for Name: product_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_detail (id, product_id, long_desc_html, created_at, updated_at, deleted_at) FROM stdin;
pdtl_01KNF86088RYHB46RFHQNZM5R2	prod_01KKS0NXER8KYP7V0W4MVZXJGB	\N	2026-04-05 16:38:57.032+00	2026-04-05 16:41:36.615+00	\N
pdtl_01KNF876YC3Q85ZE48BPT46EFR	prod_01KKS0NXERTEZQTGVZJHWQQM2A	\N	2026-04-05 16:39:36.653+00	2026-04-05 16:41:55.338+00	\N
pdtl_01KNF87ZA1PDR0HQRXCT7BJGBZ	prod_01KKS0NXERW0SFT7YBHB0PQDC4	\N	2026-04-05 16:40:01.601+00	2026-04-05 16:40:01.601+00	\N
pdtl_01KMWACZ6W1GCZRYNYG92GAKT4	prod_01KKS0NXER6GCXWSYYHDT5E9TE	<h1><strong>About this item</strong></h1><ul><li><p><span style="color:rgb(15, 17, 17)">WHY IPAD — The 11-inch iPad is now more capable than ever with the superfast A16 chip, a stunning Liquid Retina display, advanced cameras, fast Wi-Fi, USB-C connector, and four gorgeous colors.* iPad delivers a powerful way to create, stay connected, and get things done.</span><br /><br /></p></li><li><p><span style="color:rgb(15, 17, 17)">PERFORMANCE AND STORAGE — The superfast A16 chip delivers a boost in performance for your favorite activities. And with all-day battery life, iPad is perfect for playing immersive games and editing photos and videos.* Storage starts at 128GB and goes up to 512GB.*</span></p></li><li><p><span style="color:rgb(15, 17, 17)">11-INCH LIQUID RETINA DISPLAY — The gorgeous Liquid Retina display is an amazing way to watch movies or draw your next masterpiece.* True Tone adjusts the display to the color temperature of the room to make viewing comfortable in any light.</span></p></li></ul><p></p>	2026-03-29 08:12:08.284+00	2026-04-05 16:41:24.107+00	\N
\.


--
-- TOC entry 5266 (class 0 OID 17110)
-- Dependencies: 305
-- Data for Name: product_image_meta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_image_meta (id, product_id, image_id, is_main, sort_order, created_at, updated_at, deleted_at) FROM stdin;
pimg_01KNF035DQ7BYJR05060ANHDTD	prod_01KKS0NXER6GCXWSYYHDT5E9TE	sih6o8	t	2	2026-04-05 14:17:35.412+00	2026-04-05 14:17:35.412+00	2026-04-05 15:50:22.364+00
pimg_01KNF5D1X0DJY7E56VPJJ859J4	prod_01KKS0NXER6GCXWSYYHDT5E9TE	o7eo2i	t	2	2026-04-05 15:50:22.364+00	2026-04-05 15:50:22.364+00	2026-04-05 16:16:38.398+00
pimg_01KNF8ACEARYZZCBA9YCRZDSXB	prod_01KKS0NXER6GCXWSYYHDT5E9TE	rqjrui	t	0	2026-04-05 16:41:20.586+00	2026-04-05 16:41:20.586+00	\N
pimg_01KNF035DM7F0H9X6P9MK3AS2B	prod_01KKS0NXER6GCXWSYYHDT5E9TE	img_01KKS0NXEYSMW6SEME012RD493	f	0	2026-04-05 14:17:35.412+00	2026-04-05 16:16:38.398+00	2026-04-05 16:41:20.586+00
pimg_01KNF035DPFV5Y2QX6PD1XC4T8	prod_01KKS0NXER6GCXWSYYHDT5E9TE	img_01KKS0NXEY3FNPRE4NCBTCKRAK	f	1	2026-04-05 14:17:35.412+00	2026-04-05 16:16:38.398+00	2026-04-05 16:41:20.586+00
pimg_01KNF6X506FCZW8JJ54HFBVNN3	prod_01KKS0NXER6GCXWSYYHDT5E9TE	xdtjj7	t	2	2026-04-05 16:16:38.398+00	2026-04-05 16:16:38.398+00	2026-04-05 16:41:20.586+00
pimg_01KNF8AQ1T6515J9TBGR9DHRWB	prod_01KKS0NXER8KYP7V0W4MVZXJGB	cb21i8	t	0	2026-04-05 16:41:31.45+00	2026-04-05 16:41:31.45+00	\N
pimg_01KNF8BB7CP95RMSHVMQMMA5CZ	prod_01KKS0NXERTEZQTGVZJHWQQM2A	yly5a	t	0	2026-04-05 16:41:52.108+00	2026-04-05 16:41:52.108+00	\N
\.


--
-- TOC entry 5267 (class 0 OID 17119)
-- Dependencies: 306
-- Data for Name: product_option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option (id, title, product_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
opt_01KKS0NXEVQDDYPSZ1X7ZH7CKN	Size	prod_01KKS0NXERW0SFT7YBHB0PQDC4	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
opt_01KKS0NXEV2Q1BWM91EQSJJQF4	Color	prod_01KKS0NXERW0SFT7YBHB0PQDC4	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
opt_01KKS0NXEXP5W0VATCRMFQ9PB2	Size	prod_01KKS0NXER8KYP7V0W4MVZXJGB	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
opt_01KKS0NXEZ7NRBTQX34WVQSHQY	Size	prod_01KKS0NXERTEZQTGVZJHWQQM2A	\N	2026-03-15 15:08:50.531+00	2026-03-15 15:08:50.531+00	\N
opt_01KKS0NXEY5KQF93WDCDQVT077	Size	prod_01KKS0NXER6GCXWSYYHDT5E9TE	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
\.


--
-- TOC entry 5268 (class 0 OID 17126)
-- Dependencies: 307
-- Data for Name: product_option_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_value (id, value, option_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
optval_01KKS0NXETQF5C16CDF12DBK10	S	opt_01KKS0NXEVQDDYPSZ1X7ZH7CKN	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXETAAYKVW517RSTDHZG	M	opt_01KKS0NXEVQDDYPSZ1X7ZH7CKN	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXET18KMG2AF829Z3KE1	L	opt_01KKS0NXEVQDDYPSZ1X7ZH7CKN	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEV820FS2HKBVHY4V0P	XL	opt_01KKS0NXEVQDDYPSZ1X7ZH7CKN	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEVTKD5K55NK1DN3TBV	Black	opt_01KKS0NXEV2Q1BWM91EQSJJQF4	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEVYY5H2XVESQCXTRD3	White	opt_01KKS0NXEV2Q1BWM91EQSJJQF4	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEXRGWS9E975PT9S9K5	S	opt_01KKS0NXEXP5W0VATCRMFQ9PB2	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEX3N0ZX8NC3P0A19MV	M	opt_01KKS0NXEXP5W0VATCRMFQ9PB2	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEXP7DTAYJAZ8012YPK	L	opt_01KKS0NXEXP5W0VATCRMFQ9PB2	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEXFYC9Z41RQ07ZKDCW	XL	opt_01KKS0NXEXP5W0VATCRMFQ9PB2	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEZ3CXNPTF6QN4BT6K9	S	opt_01KKS0NXEZ7NRBTQX34WVQSHQY	\N	2026-03-15 15:08:50.531+00	2026-03-15 15:08:50.531+00	\N
optval_01KKS0NXEZG661ZG1EBDKPDXJE	M	opt_01KKS0NXEZ7NRBTQX34WVQSHQY	\N	2026-03-15 15:08:50.531+00	2026-03-15 15:08:50.531+00	\N
optval_01KKS0NXEZ52HRWVCC8XPJ24P8	L	opt_01KKS0NXEZ7NRBTQX34WVQSHQY	\N	2026-03-15 15:08:50.531+00	2026-03-15 15:08:50.531+00	\N
optval_01KKS0NXEZDXG1AGQVV3VXGBR4	XL	opt_01KKS0NXEZ7NRBTQX34WVQSHQY	\N	2026-03-15 15:08:50.531+00	2026-03-15 15:08:50.531+00	\N
optval_01KKS0NXEYYRGEXZY6XEVN4JH3	S	opt_01KKS0NXEY5KQF93WDCDQVT077	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEYWSZC0Y8HVQQMZAFW	M	opt_01KKS0NXEY5KQF93WDCDQVT077	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEY18EETN33YEBXBG01	L	opt_01KKS0NXEY5KQF93WDCDQVT077	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KKS0NXEYSQ0DA38JDG9XPWJZ	XL	opt_01KKS0NXEY5KQF93WDCDQVT077	\N	2026-03-15 15:08:50.53+00	2026-03-15 15:08:50.53+00	\N
optval_01KMW8ZDEQ8S1CDX9RHK9SA451	XXL	opt_01KKS0NXEY5KQF93WDCDQVT077	\N	2026-03-29 07:47:15.515721+00	2026-03-29 07:47:15.515721+00	\N
\.


--
-- TOC entry 5269 (class 0 OID 17133)
-- Dependencies: 308
-- Data for Name: product_sales_channel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_sales_channel (product_id, sales_channel_id, id, created_at, updated_at, deleted_at) FROM stdin;
prod_01KKS0NXERW0SFT7YBHB0PQDC4	sc_01KKS0NJHVM2S73KTPZF792K8F	prodsc_01KKS0NXGEC0AMSWXQAENEP6Y6	2026-03-15 15:08:50.574407+00	2026-03-15 15:08:50.574407+00	\N
prod_01KKS0NXER8KYP7V0W4MVZXJGB	sc_01KKS0NJHVM2S73KTPZF792K8F	prodsc_01KKS0NXGFRCH7W1ZREWB08PD9	2026-03-15 15:08:50.574407+00	2026-03-15 15:08:50.574407+00	\N
prod_01KKS0NXER6GCXWSYYHDT5E9TE	sc_01KKS0NJHVM2S73KTPZF792K8F	prodsc_01KKS0NXGF35EMD6M5C8DH5JER	2026-03-15 15:08:50.574407+00	2026-03-15 15:08:50.574407+00	\N
prod_01KKS0NXERTEZQTGVZJHWQQM2A	sc_01KKS0NJHVM2S73KTPZF792K8F	prodsc_01KKS0NXGFEGX5N66ESN6PGQKV	2026-03-15 15:08:50.574407+00	2026-03-15 15:08:50.574407+00	\N
\.


--
-- TOC entry 5270 (class 0 OID 17140)
-- Dependencies: 309
-- Data for Name: product_shipping_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_shipping_profile (product_id, shipping_profile_id, id, created_at, updated_at, deleted_at) FROM stdin;
prod_01KKS0NXERW0SFT7YBHB0PQDC4	sp_01KKS0N76BHWM622Y5CCGWFH2D	prodsp_01KKS0NXH1MWRYFQ8MJ80QQSNJ	2026-03-15 15:08:50.593624+00	2026-03-15 15:08:50.593624+00	\N
prod_01KKS0NXER8KYP7V0W4MVZXJGB	sp_01KKS0N76BHWM622Y5CCGWFH2D	prodsp_01KKS0NXH269TQTD9FQM7K4B91	2026-03-15 15:08:50.593624+00	2026-03-15 15:08:50.593624+00	\N
prod_01KKS0NXER6GCXWSYYHDT5E9TE	sp_01KKS0N76BHWM622Y5CCGWFH2D	prodsp_01KKS0NXH224Q61FBNPW22KJHQ	2026-03-15 15:08:50.593624+00	2026-03-15 15:08:50.593624+00	\N
prod_01KKS0NXERTEZQTGVZJHWQQM2A	sp_01KKS0N76BHWM622Y5CCGWFH2D	prodsp_01KKS0NXH2PDC2TX3ZBQ15KDCG	2026-03-15 15:08:50.593624+00	2026-03-15 15:08:50.593624+00	\N
\.


--
-- TOC entry 5271 (class 0 OID 17147)
-- Dependencies: 310
-- Data for Name: product_tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_tag (id, value, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5272 (class 0 OID 17154)
-- Dependencies: 311
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_tags (product_id, product_tag_id) FROM stdin;
\.


--
-- TOC entry 5273 (class 0 OID 17159)
-- Dependencies: 312
-- Data for Name: product_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_type (id, value, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5274 (class 0 OID 17166)
-- Dependencies: 313
-- Data for Name: product_variant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant (id, title, sku, barcode, ean, upc, allow_backorder, manage_inventory, hs_code, origin_country, mid_code, material, weight, length, height, width, metadata, variant_rank, product_id, created_at, updated_at, deleted_at, thumbnail) FROM stdin;
variant_01KKS0NXJ0DXMHKZPHF92C80RS	S / Black	SHIRT-S-BLACK	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERW0SFT7YBHB0PQDC4	2026-03-15 15:08:50.63+00	2026-03-15 15:08:50.63+00	\N	\N
variant_01KKS0NXJ0SH5WSGQG2AFXY6H8	S / White	SHIRT-S-WHITE	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERW0SFT7YBHB0PQDC4	2026-03-15 15:08:50.63+00	2026-03-15 15:08:50.63+00	\N	\N
variant_01KKS0NXJ1F47FMGMDEN317W58	M / Black	SHIRT-M-BLACK	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERW0SFT7YBHB0PQDC4	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ1YZJQNX8TQ7Z16H3F	M / White	SHIRT-M-WHITE	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERW0SFT7YBHB0PQDC4	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ1BMX9E4QRGE1S4RTA	L / Black	SHIRT-L-BLACK	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERW0SFT7YBHB0PQDC4	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ2CCHYAQD4NR0SCWCF	L / White	SHIRT-L-WHITE	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERW0SFT7YBHB0PQDC4	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ2P62CM95VCJSMKR2N	XL / Black	SHIRT-XL-BLACK	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERW0SFT7YBHB0PQDC4	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ2JCHQEG4QPNNYT8KT	XL / White	SHIRT-XL-WHITE	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERW0SFT7YBHB0PQDC4	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ3G9VBA54CADHC4PFY	S	SWEATSHIRT-S	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXER8KYP7V0W4MVZXJGB	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ3TDJEKQ0X293Y4TDA	M	SWEATSHIRT-M	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXER8KYP7V0W4MVZXJGB	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	L	SWEATSHIRT-L	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXER8KYP7V0W4MVZXJGB	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ347P38ZTMBQCA0EF8	XL	SWEATSHIRT-XL	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXER8KYP7V0W4MVZXJGB	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ35DQKSZNNGW9DQPZR	S	SWEATPANTS-S	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXER6GCXWSYYHDT5E9TE	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ45CN25Z2Y5BH8R3Y1	M	SWEATPANTS-M	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXER6GCXWSYYHDT5E9TE	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ4E4S71WKW4BKEFC7Q	L	SWEATPANTS-L	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXER6GCXWSYYHDT5E9TE	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ49QMTV0RV35JPNKJK	XL	SWEATPANTS-XL	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXER6GCXWSYYHDT5E9TE	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ468WFHB5JPG46TJHJ	S	SHORTS-S	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERTEZQTGVZJHWQQM2A	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ5TXE692HKCMW8QCYR	M	SHORTS-M	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERTEZQTGVZJHWQQM2A	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ5GTP0HTQG6NJS71NZ	L	SHORTS-L	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERTEZQTGVZJHWQQM2A	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
variant_01KKS0NXJ5E05XKQHBBT8R9KXS	XL	SHORTS-XL	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KKS0NXERTEZQTGVZJHWQQM2A	2026-03-15 15:08:50.631+00	2026-03-15 15:08:50.631+00	\N	\N
\.


--
-- TOC entry 5275 (class 0 OID 17176)
-- Dependencies: 314
-- Data for Name: product_variant_inventory_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_inventory_item (variant_id, inventory_item_id, id, required_quantity, created_at, updated_at, deleted_at) FROM stdin;
variant_01KKS0NXJ0DXMHKZPHF92C80RS	iitem_01KKS0NXK375PKK6QFGMNM3JJP	pvitem_01KKS0NXKTH27BMDV1QZ9Z7WRV	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ0SH5WSGQG2AFXY6H8	iitem_01KKS0NXK4ABJNW3M2KG25FWH8	pvitem_01KKS0NXKVXJ51YTEFDC8T5QB9	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ1F47FMGMDEN317W58	iitem_01KKS0NXK4GDJFR4Y8M2WJQMPG	pvitem_01KKS0NXKVV1Z9GWRW6EEBJH01	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ1YZJQNX8TQ7Z16H3F	iitem_01KKS0NXK4KQ1T39EF89079SXD	pvitem_01KKS0NXKV44V0TMSDH8JH9WBE	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ1BMX9E4QRGE1S4RTA	iitem_01KKS0NXK4186ZE627VQM4W9DS	pvitem_01KKS0NXKV1YJAAA866DEK2AQ8	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ2CCHYAQD4NR0SCWCF	iitem_01KKS0NXK4FGW5QTT1P9M5GXMG	pvitem_01KKS0NXKVYTPWRTXWM79CGHPE	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ2P62CM95VCJSMKR2N	iitem_01KKS0NXK4DH32BEN4Y90Z2WCE	pvitem_01KKS0NXKV3EWA3JAJ60G0R4PH	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ2JCHQEG4QPNNYT8KT	iitem_01KKS0NXK4R65Z65WSAZBTKYYZ	pvitem_01KKS0NXKVVDGW5HBEDGZD5A60	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ3G9VBA54CADHC4PFY	iitem_01KKS0NXK49C9HTJ2XZTS0EKPA	pvitem_01KKS0NXKVBEXCXTTBS4PZ76A4	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ3TDJEKQ0X293Y4TDA	iitem_01KKS0NXK5B0T0EE57TJ5WM8A8	pvitem_01KKS0NXKV5026GMZVVWCNY6JH	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	iitem_01KKS0NXK5EBVCGBYF1Y95VN34	pvitem_01KKS0NXKVR5M6JGVYMTJQBMFP	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ347P38ZTMBQCA0EF8	iitem_01KKS0NXK5HFJDNH01JDYAE734	pvitem_01KKS0NXKWCRKPPN9YFW5EV79A	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ35DQKSZNNGW9DQPZR	iitem_01KKS0NXK56M41XVZPG3CTWXQB	pvitem_01KKS0NXKW8N3BPR9HE18B0T0X	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ45CN25Z2Y5BH8R3Y1	iitem_01KKS0NXK5KZCDPB4XQNG9WMAK	pvitem_01KKS0NXKW4T6CG41N59RGHN1R	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ4E4S71WKW4BKEFC7Q	iitem_01KKS0NXK57VB0SSTSNFP2Z2BB	pvitem_01KKS0NXKWSGCT0DPRMQZJ13CE	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ49QMTV0RV35JPNKJK	iitem_01KKS0NXK500RPZ4VD6VTV4KGN	pvitem_01KKS0NXKW8AGK1XVZ735H6R00	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ468WFHB5JPG46TJHJ	iitem_01KKS0NXK5HZKVWKVHR1YMM4HK	pvitem_01KKS0NXKWJJVBV5XMZBR9Q0PP	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ5TXE692HKCMW8QCYR	iitem_01KKS0NXK5HQYV4KH1AZBF6DBK	pvitem_01KKS0NXKWRWJSJWM9Z5PQ4YHY	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ5GTP0HTQG6NJS71NZ	iitem_01KKS0NXK6T2W9PWEZMM8CRCTD	pvitem_01KKS0NXKWFB575WW9BJ3BZFVA	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
variant_01KKS0NXJ5E05XKQHBBT8R9KXS	iitem_01KKS0NXK60S34JCZ059ND2HHM	pvitem_01KKS0NXKW8MXSDYR5TPFY6S6D	1	2026-03-15 15:08:50.682673+00	2026-03-15 15:08:50.682673+00	\N
\.


--
-- TOC entry 5276 (class 0 OID 17184)
-- Dependencies: 315
-- Data for Name: product_variant_option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_option (variant_id, option_value_id) FROM stdin;
variant_01KKS0NXJ0DXMHKZPHF92C80RS	optval_01KKS0NXETQF5C16CDF12DBK10
variant_01KKS0NXJ0DXMHKZPHF92C80RS	optval_01KKS0NXEVTKD5K55NK1DN3TBV
variant_01KKS0NXJ0SH5WSGQG2AFXY6H8	optval_01KKS0NXETQF5C16CDF12DBK10
variant_01KKS0NXJ0SH5WSGQG2AFXY6H8	optval_01KKS0NXEVYY5H2XVESQCXTRD3
variant_01KKS0NXJ1F47FMGMDEN317W58	optval_01KKS0NXETAAYKVW517RSTDHZG
variant_01KKS0NXJ1F47FMGMDEN317W58	optval_01KKS0NXEVTKD5K55NK1DN3TBV
variant_01KKS0NXJ1YZJQNX8TQ7Z16H3F	optval_01KKS0NXETAAYKVW517RSTDHZG
variant_01KKS0NXJ1YZJQNX8TQ7Z16H3F	optval_01KKS0NXEVYY5H2XVESQCXTRD3
variant_01KKS0NXJ1BMX9E4QRGE1S4RTA	optval_01KKS0NXET18KMG2AF829Z3KE1
variant_01KKS0NXJ1BMX9E4QRGE1S4RTA	optval_01KKS0NXEVTKD5K55NK1DN3TBV
variant_01KKS0NXJ2CCHYAQD4NR0SCWCF	optval_01KKS0NXET18KMG2AF829Z3KE1
variant_01KKS0NXJ2CCHYAQD4NR0SCWCF	optval_01KKS0NXEVYY5H2XVESQCXTRD3
variant_01KKS0NXJ2P62CM95VCJSMKR2N	optval_01KKS0NXEV820FS2HKBVHY4V0P
variant_01KKS0NXJ2P62CM95VCJSMKR2N	optval_01KKS0NXEVTKD5K55NK1DN3TBV
variant_01KKS0NXJ2JCHQEG4QPNNYT8KT	optval_01KKS0NXEV820FS2HKBVHY4V0P
variant_01KKS0NXJ2JCHQEG4QPNNYT8KT	optval_01KKS0NXEVYY5H2XVESQCXTRD3
variant_01KKS0NXJ3G9VBA54CADHC4PFY	optval_01KKS0NXEXRGWS9E975PT9S9K5
variant_01KKS0NXJ3TDJEKQ0X293Y4TDA	optval_01KKS0NXEX3N0ZX8NC3P0A19MV
variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	optval_01KKS0NXEXP7DTAYJAZ8012YPK
variant_01KKS0NXJ347P38ZTMBQCA0EF8	optval_01KKS0NXEXFYC9Z41RQ07ZKDCW
variant_01KKS0NXJ35DQKSZNNGW9DQPZR	optval_01KKS0NXEYYRGEXZY6XEVN4JH3
variant_01KKS0NXJ45CN25Z2Y5BH8R3Y1	optval_01KKS0NXEYWSZC0Y8HVQQMZAFW
variant_01KKS0NXJ4E4S71WKW4BKEFC7Q	optval_01KKS0NXEY18EETN33YEBXBG01
variant_01KKS0NXJ49QMTV0RV35JPNKJK	optval_01KKS0NXEYSQ0DA38JDG9XPWJZ
variant_01KKS0NXJ468WFHB5JPG46TJHJ	optval_01KKS0NXEZ3CXNPTF6QN4BT6K9
variant_01KKS0NXJ5TXE692HKCMW8QCYR	optval_01KKS0NXEZG661ZG1EBDKPDXJE
variant_01KKS0NXJ5GTP0HTQG6NJS71NZ	optval_01KKS0NXEZ52HRWVCC8XPJ24P8
variant_01KKS0NXJ5E05XKQHBBT8R9KXS	optval_01KKS0NXEZDXG1AGQVV3VXGBR4
\.


--
-- TOC entry 5277 (class 0 OID 17189)
-- Dependencies: 316
-- Data for Name: product_variant_price_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
variant_01KKS0NXJ0DXMHKZPHF92C80RS	pset_01KKS0NXM9EZV1NYPK0NDQTEXJ	pvps_01KKS0NXP4W2QTRA6NK0W50CWG	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ0SH5WSGQG2AFXY6H8	pset_01KKS0NXM9FCC8CAAX7QRPZZP8	pvps_01KKS0NXP5D26WMXTBYETR2JXG	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ1F47FMGMDEN317W58	pset_01KKS0NXMABXWC68BJZZ86M2MD	pvps_01KKS0NXP50MFWW2J99JK7XE8Y	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ1YZJQNX8TQ7Z16H3F	pset_01KKS0NXMATQF244W1C77KV4H4	pvps_01KKS0NXP585SYTPTQ6VJDSBST	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ1BMX9E4QRGE1S4RTA	pset_01KKS0NXMAEFA989M4FN4XEX2M	pvps_01KKS0NXP5FGPGTV5M6J5D83R8	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ2CCHYAQD4NR0SCWCF	pset_01KKS0NXMAMSAQE8E4SCCX1PQG	pvps_01KKS0NXP5MKQSHYY48M380M67	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ2P62CM95VCJSMKR2N	pset_01KKS0NXMBCKMAZKHVWEQ38BQR	pvps_01KKS0NXP53P6A916YDV69112N	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ2JCHQEG4QPNNYT8KT	pset_01KKS0NXMBYEQFSVBPERMWZTVZ	pvps_01KKS0NXP6P4SBZDBAZ5H5TFB2	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ3G9VBA54CADHC4PFY	pset_01KKS0NXMB802XZ9GS3965JC4H	pvps_01KKS0NXP6EQ56RBJV7493QA0B	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ3TDJEKQ0X293Y4TDA	pset_01KKS0NXMB64A9X8HNN9DWRYDA	pvps_01KKS0NXP6QP1K84XYMKES270N	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ3T9BWJ7NTQMB9AJ26	pset_01KKS0NXMCF6EBX2DW9KG2EEYQ	pvps_01KKS0NXP6GV8AGVQGKYGG5YRN	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ347P38ZTMBQCA0EF8	pset_01KKS0NXMCAA8MPHD0HTXGCGFF	pvps_01KKS0NXP6WEPMQ3J8RGT14GC5	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ35DQKSZNNGW9DQPZR	pset_01KKS0NXMC055K55B7NTG4ETEY	pvps_01KKS0NXP6D6HRJB46SEAX11W4	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ45CN25Z2Y5BH8R3Y1	pset_01KKS0NXMCYDHSHA2KCK65CCY3	pvps_01KKS0NXP6MB27P00CDHCQRTTE	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ4E4S71WKW4BKEFC7Q	pset_01KKS0NXMDW0A7KVFG5ZWAFBQ4	pvps_01KKS0NXP6CJJ18FQK5D9CYEQN	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ49QMTV0RV35JPNKJK	pset_01KKS0NXMDYV852D6TDS23PQ90	pvps_01KKS0NXP6094MZCSB9A14GQV3	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ468WFHB5JPG46TJHJ	pset_01KKS0NXMDTGS07D1AWKZS9M64	pvps_01KKS0NXP73WW6MDHJ8KC3466B	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ5TXE692HKCMW8QCYR	pset_01KKS0NXMD6W04AAV1FS8ZDQN4	pvps_01KKS0NXP7V33ABMG184JQNE1S	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ5GTP0HTQG6NJS71NZ	pset_01KKS0NXMEF5E793C5TTM6DK3S	pvps_01KKS0NXP79BX6YD1251PQ81D9	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
variant_01KKS0NXJ5E05XKQHBBT8R9KXS	pset_01KKS0NXME6EGSFBGTRDAWH6XM	pvps_01KKS0NXP7SCZ957SM64MNK3G6	2026-03-15 15:08:50.757023+00	2026-03-15 15:08:50.757023+00	\N
\.


--
-- TOC entry 5278 (class 0 OID 17196)
-- Dependencies: 317
-- Data for Name: product_variant_product_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_product_image (id, variant_id, image_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5279 (class 0 OID 17203)
-- Dependencies: 318
-- Data for Name: promotion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion (id, code, campaign_id, is_automatic, type, created_at, updated_at, deleted_at, status, is_tax_inclusive, "limit", used, metadata) FROM stdin;
\.


--
-- TOC entry 5280 (class 0 OID 17216)
-- Dependencies: 319
-- Data for Name: promotion_application_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_application_method (id, value, raw_value, max_quantity, apply_to_quantity, buy_rules_min_quantity, type, target_type, allocation, promotion_id, created_at, updated_at, deleted_at, currency_code) FROM stdin;
\.


--
-- TOC entry 5281 (class 0 OID 17226)
-- Dependencies: 320
-- Data for Name: promotion_campaign; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_campaign (id, name, description, campaign_identifier, starts_at, ends_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5282 (class 0 OID 17233)
-- Dependencies: 321
-- Data for Name: promotion_campaign_budget; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_campaign_budget (id, type, campaign_id, "limit", raw_limit, used, raw_used, created_at, updated_at, deleted_at, currency_code, attribute) FROM stdin;
\.


--
-- TOC entry 5283 (class 0 OID 17242)
-- Dependencies: 322
-- Data for Name: promotion_campaign_budget_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_campaign_budget_usage (id, attribute_value, used, budget_id, raw_used, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5284 (class 0 OID 17250)
-- Dependencies: 323
-- Data for Name: promotion_promotion_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_promotion_rule (promotion_id, promotion_rule_id) FROM stdin;
\.


--
-- TOC entry 5285 (class 0 OID 17255)
-- Dependencies: 324
-- Data for Name: promotion_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_rule (id, description, attribute, operator, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5286 (class 0 OID 17263)
-- Dependencies: 325
-- Data for Name: promotion_rule_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_rule_value (id, promotion_rule_id, value, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5287 (class 0 OID 17270)
-- Dependencies: 326
-- Data for Name: provider_identity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provider_identity (id, entity_id, provider, auth_identity_id, user_metadata, provider_metadata, created_at, updated_at, deleted_at) FROM stdin;
01KKS0RH21VQXJY80DDEE66YXZ	1913045515@qq.com	emailpass	authid_01KKS0RH23SBDS07QSBWC9PXQ9	\N	{"password": "c2NyeXB0AA8AAAAIAAAAAa/fOTuwvSz3sNPkKinWtjh27KEREpx+dvqQAgPY2zSLHr7p1dzo4x+9nbdju5WmJz0XRj6rY7aTj2owKpdzqrJvaUTcsfFR4U0XfnmKkzVv"}	2026-03-15 15:10:16.133+00	2026-03-15 15:10:16.133+00	\N
01KKVJHTNF19JX6DGAYP5RHHDQ	208017534@qq.com	emailpass	authid_01KKVJHTNFT6EAFGBHA9VQZA7A	\N	{"password": "c2NyeXB0AA8AAAAIAAAAAaR6Q9nQGFR404N5LBmJn1LhnP6TBDiBSN24jEj0B3UsjeC+I7dUq3wYD8WScaVGldf37RVao0ROfUDOonEjsvJ+nDbb1iBbURbjWk4r8I2m"}	2026-03-16 14:59:39.824+00	2026-03-16 14:59:39.824+00	\N
\.


--
-- TOC entry 5288 (class 0 OID 17277)
-- Dependencies: 327
-- Data for Name: publishable_api_key_sales_channel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publishable_api_key_sales_channel (publishable_key_id, sales_channel_id, id, created_at, updated_at, deleted_at) FROM stdin;
apk_01KKS0NJKVPKB85ZC6Z7SW53GP	sc_01KKS0NJHVM2S73KTPZF792K8F	pksc_01KKS0NXDJSNKP9TCGPY3TYC7G	2026-03-15 15:08:39.430821+00	2026-03-15 15:08:39.430821+00	\N
apk_01KNCDBP4F1CFAFK3PHX8VVGMF	sc_01KKS0NJHVM2S73KTPZF792K8F	pksc_01KNCDBZ86C9D4ME02DS9NG6TZ	2026-04-04 14:11:52.197476+00	2026-04-04 14:11:52.197476+00	\N
\.


--
-- TOC entry 5289 (class 0 OID 17284)
-- Dependencies: 328
-- Data for Name: refund; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refund (id, amount, raw_amount, payment_id, created_at, updated_at, deleted_at, created_by, metadata, refund_reason_id, note) FROM stdin;
\.


--
-- TOC entry 5290 (class 0 OID 17291)
-- Dependencies: 329
-- Data for Name: refund_reason; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refund_reason (id, label, description, metadata, created_at, updated_at, deleted_at, code) FROM stdin;
refr_01KKS0MMQQJE93FPX4CPYWBWAH	Shipping Issue	Refund due to lost, delayed, or misdelivered shipment	\N	2026-03-15 15:08:08.603564+00	2026-03-15 15:08:08.603564+00	\N	shipping_issue
refr_01KKS0MMQR1MPW5JV4V20Y5373	Customer Care Adjustment	Refund given as goodwill or compensation for inconvenience	\N	2026-03-15 15:08:08.603564+00	2026-03-15 15:08:08.603564+00	\N	customer_care_adjustment
refr_01KKS0MMQRZKEP0187C0S1SQF7	Pricing Error	Refund to correct an overcharge, missing discount, or incorrect price	\N	2026-03-15 15:08:08.603564+00	2026-03-15 15:08:08.603564+00	\N	pricing_error
\.


--
-- TOC entry 5291 (class 0 OID 17298)
-- Dependencies: 330
-- Data for Name: region; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.region (id, name, currency_code, metadata, created_at, updated_at, deleted_at, automatic_taxes) FROM stdin;
reg_01KKS0NX3SA64NJ3XV501K8DX9	Europe	eur	\N	2026-03-15 15:08:50.182+00	2026-03-15 15:08:50.182+00	\N	t
reg_01KMR2KKDP7ZBBVMJJ56BJBR3X	us	usd	\N	2026-03-27 16:38:59.268+00	2026-03-27 16:38:59.268+00	\N	t
\.


--
-- TOC entry 5292 (class 0 OID 17306)
-- Dependencies: 331
-- Data for Name: region_country; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.region_country (iso_2, iso_3, num_code, name, display_name, region_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
af	afg	004	AFGHANISTAN	Afghanistan	\N	\N	2026-03-15 15:08:24.803+00	2026-03-15 15:08:24.803+00	\N
al	alb	008	ALBANIA	Albania	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
dz	dza	012	ALGERIA	Algeria	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
as	asm	016	AMERICAN SAMOA	American Samoa	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
ad	and	020	ANDORRA	Andorra	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
ao	ago	024	ANGOLA	Angola	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
ai	aia	660	ANGUILLA	Anguilla	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
aq	ata	010	ANTARCTICA	Antarctica	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
ag	atg	028	ANTIGUA AND BARBUDA	Antigua and Barbuda	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
ar	arg	032	ARGENTINA	Argentina	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
am	arm	051	ARMENIA	Armenia	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
aw	abw	533	ARUBA	Aruba	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
au	aus	036	AUSTRALIA	Australia	\N	\N	2026-03-15 15:08:24.805+00	2026-03-15 15:08:24.805+00	\N
at	aut	040	AUSTRIA	Austria	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
az	aze	031	AZERBAIJAN	Azerbaijan	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bs	bhs	044	BAHAMAS	Bahamas	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bh	bhr	048	BAHRAIN	Bahrain	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bd	bgd	050	BANGLADESH	Bangladesh	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bb	brb	052	BARBADOS	Barbados	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
by	blr	112	BELARUS	Belarus	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
be	bel	056	BELGIUM	Belgium	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bz	blz	084	BELIZE	Belize	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bj	ben	204	BENIN	Benin	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bm	bmu	060	BERMUDA	Bermuda	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bt	btn	064	BHUTAN	Bhutan	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bo	bol	068	BOLIVIA	Bolivia	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bq	bes	535	BONAIRE, SINT EUSTATIUS AND SABA	Bonaire, Sint Eustatius and Saba	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
ba	bih	070	BOSNIA AND HERZEGOVINA	Bosnia and Herzegovina	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bw	bwa	072	BOTSWANA	Botswana	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bv	bvd	074	BOUVET ISLAND	Bouvet Island	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
br	bra	076	BRAZIL	Brazil	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
io	iot	086	BRITISH INDIAN OCEAN TERRITORY	British Indian Ocean Territory	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bn	brn	096	BRUNEI DARUSSALAM	Brunei Darussalam	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bg	bgr	100	BULGARIA	Bulgaria	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bf	bfa	854	BURKINA FASO	Burkina Faso	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
bi	bdi	108	BURUNDI	Burundi	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
kh	khm	116	CAMBODIA	Cambodia	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cm	cmr	120	CAMEROON	Cameroon	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
ca	can	124	CANADA	Canada	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cv	cpv	132	CAPE VERDE	Cape Verde	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
ky	cym	136	CAYMAN ISLANDS	Cayman Islands	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cf	caf	140	CENTRAL AFRICAN REPUBLIC	Central African Republic	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
td	tcd	148	CHAD	Chad	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cl	chl	152	CHILE	Chile	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cn	chn	156	CHINA	China	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cx	cxr	162	CHRISTMAS ISLAND	Christmas Island	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cc	cck	166	COCOS (KEELING) ISLANDS	Cocos (Keeling) Islands	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
co	col	170	COLOMBIA	Colombia	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
km	com	174	COMOROS	Comoros	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cg	cog	178	CONGO	Congo	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cd	cod	180	CONGO, THE DEMOCRATIC REPUBLIC OF THE	Congo, the Democratic Republic of the	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
ck	cok	184	COOK ISLANDS	Cook Islands	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cr	cri	188	COSTA RICA	Costa Rica	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
ci	civ	384	COTE D'IVOIRE	Cote D'Ivoire	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
hr	hrv	191	CROATIA	Croatia	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cu	cub	192	CUBA	Cuba	\N	\N	2026-03-15 15:08:24.806+00	2026-03-15 15:08:24.806+00	\N
cw	cuw	531	CURAÇAO	Curaçao	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
cy	cyp	196	CYPRUS	Cyprus	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
cz	cze	203	CZECH REPUBLIC	Czech Republic	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
dj	dji	262	DJIBOUTI	Djibouti	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
dm	dma	212	DOMINICA	Dominica	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
do	dom	214	DOMINICAN REPUBLIC	Dominican Republic	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
ec	ecu	218	ECUADOR	Ecuador	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
eg	egy	818	EGYPT	Egypt	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
sv	slv	222	EL SALVADOR	El Salvador	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gq	gnq	226	EQUATORIAL GUINEA	Equatorial Guinea	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
er	eri	232	ERITREA	Eritrea	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
ee	est	233	ESTONIA	Estonia	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
et	eth	231	ETHIOPIA	Ethiopia	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
fk	flk	238	FALKLAND ISLANDS (MALVINAS)	Falkland Islands (Malvinas)	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
fo	fro	234	FAROE ISLANDS	Faroe Islands	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
fj	fji	242	FIJI	Fiji	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
fi	fin	246	FINLAND	Finland	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gf	guf	254	FRENCH GUIANA	French Guiana	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
pf	pyf	258	FRENCH POLYNESIA	French Polynesia	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
tf	atf	260	FRENCH SOUTHERN TERRITORIES	French Southern Territories	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
ga	gab	266	GABON	Gabon	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gm	gmb	270	GAMBIA	Gambia	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
ge	geo	268	GEORGIA	Georgia	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gh	gha	288	GHANA	Ghana	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gi	gib	292	GIBRALTAR	Gibraltar	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gr	grc	300	GREECE	Greece	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gl	grl	304	GREENLAND	Greenland	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gd	grd	308	GRENADA	Grenada	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gp	glp	312	GUADELOUPE	Guadeloupe	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gu	gum	316	GUAM	Guam	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gt	gtm	320	GUATEMALA	Guatemala	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gg	ggy	831	GUERNSEY	Guernsey	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gn	gin	324	GUINEA	Guinea	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gw	gnb	624	GUINEA-BISSAU	Guinea-Bissau	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
gy	guy	328	GUYANA	Guyana	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
ht	hti	332	HAITI	Haiti	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
hm	hmd	334	HEARD ISLAND AND MCDONALD ISLANDS	Heard Island And Mcdonald Islands	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
va	vat	336	HOLY SEE (VATICAN CITY STATE)	Holy See (Vatican City State)	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
hn	hnd	340	HONDURAS	Honduras	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
hk	hkg	344	HONG KONG	Hong Kong	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
hu	hun	348	HUNGARY	Hungary	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
is	isl	352	ICELAND	Iceland	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
in	ind	356	INDIA	India	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
id	idn	360	INDONESIA	Indonesia	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
ir	irn	364	IRAN, ISLAMIC REPUBLIC OF	Iran, Islamic Republic of	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
iq	irq	368	IRAQ	Iraq	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
ie	irl	372	IRELAND	Ireland	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
im	imn	833	ISLE OF MAN	Isle Of Man	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
il	isr	376	ISRAEL	Israel	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
jm	jam	388	JAMAICA	Jamaica	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
jp	jpn	392	JAPAN	Japan	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
je	jey	832	JERSEY	Jersey	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
jo	jor	400	JORDAN	Jordan	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
kz	kaz	398	KAZAKHSTAN	Kazakhstan	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
ke	ken	404	KENYA	Kenya	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
ki	kir	296	KIRIBATI	Kiribati	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
kp	prk	408	KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF	Korea, Democratic People's Republic of	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
kr	kor	410	KOREA, REPUBLIC OF	Korea, Republic of	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.807+00	\N
xk	xkx	900	KOSOVO	Kosovo	\N	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:24.808+00	\N
kw	kwt	414	KUWAIT	Kuwait	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
kg	kgz	417	KYRGYZSTAN	Kyrgyzstan	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
la	lao	418	LAO PEOPLE'S DEMOCRATIC REPUBLIC	Lao People's Democratic Republic	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
lv	lva	428	LATVIA	Latvia	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
lb	lbn	422	LEBANON	Lebanon	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ls	lso	426	LESOTHO	Lesotho	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
lr	lbr	430	LIBERIA	Liberia	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ly	lby	434	LIBYA	Libya	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
li	lie	438	LIECHTENSTEIN	Liechtenstein	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
lt	ltu	440	LITHUANIA	Lithuania	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
lu	lux	442	LUXEMBOURG	Luxembourg	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mo	mac	446	MACAO	Macao	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mg	mdg	450	MADAGASCAR	Madagascar	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mw	mwi	454	MALAWI	Malawi	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
my	mys	458	MALAYSIA	Malaysia	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mv	mdv	462	MALDIVES	Maldives	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ml	mli	466	MALI	Mali	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mt	mlt	470	MALTA	Malta	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mh	mhl	584	MARSHALL ISLANDS	Marshall Islands	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mq	mtq	474	MARTINIQUE	Martinique	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mr	mrt	478	MAURITANIA	Mauritania	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mu	mus	480	MAURITIUS	Mauritius	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
yt	myt	175	MAYOTTE	Mayotte	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mx	mex	484	MEXICO	Mexico	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
fm	fsm	583	MICRONESIA, FEDERATED STATES OF	Micronesia, Federated States of	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
md	mda	498	MOLDOVA, REPUBLIC OF	Moldova, Republic of	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mc	mco	492	MONACO	Monaco	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mn	mng	496	MONGOLIA	Mongolia	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
me	mne	499	MONTENEGRO	Montenegro	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ms	msr	500	MONTSERRAT	Montserrat	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ma	mar	504	MOROCCO	Morocco	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mz	moz	508	MOZAMBIQUE	Mozambique	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mm	mmr	104	MYANMAR	Myanmar	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
na	nam	516	NAMIBIA	Namibia	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
nr	nru	520	NAURU	Nauru	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
np	npl	524	NEPAL	Nepal	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
nl	nld	528	NETHERLANDS	Netherlands	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
nc	ncl	540	NEW CALEDONIA	New Caledonia	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
nz	nzl	554	NEW ZEALAND	New Zealand	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ni	nic	558	NICARAGUA	Nicaragua	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ne	ner	562	NIGER	Niger	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ng	nga	566	NIGERIA	Nigeria	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
nu	niu	570	NIUE	Niue	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
nf	nfk	574	NORFOLK ISLAND	Norfolk Island	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mk	mkd	807	NORTH MACEDONIA	North Macedonia	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
mp	mnp	580	NORTHERN MARIANA ISLANDS	Northern Mariana Islands	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
no	nor	578	NORWAY	Norway	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
om	omn	512	OMAN	Oman	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
pk	pak	586	PAKISTAN	Pakistan	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
pw	plw	585	PALAU	Palau	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ps	pse	275	PALESTINIAN TERRITORY, OCCUPIED	Palestinian Territory, Occupied	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
pa	pan	591	PANAMA	Panama	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
pg	png	598	PAPUA NEW GUINEA	Papua New Guinea	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
py	pry	600	PARAGUAY	Paraguay	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
pe	per	604	PERU	Peru	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
ph	phl	608	PHILIPPINES	Philippines	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
pn	pcn	612	PITCAIRN	Pitcairn	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
pl	pol	616	POLAND	Poland	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
pt	prt	620	PORTUGAL	Portugal	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
pr	pri	630	PUERTO RICO	Puerto Rico	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
qa	qat	634	QATAR	Qatar	\N	\N	2026-03-15 15:08:24.808+00	2026-03-15 15:08:24.808+00	\N
re	reu	638	REUNION	Reunion	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ro	rom	642	ROMANIA	Romania	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ru	rus	643	RUSSIAN FEDERATION	Russian Federation	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
rw	rwa	646	RWANDA	Rwanda	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
bl	blm	652	SAINT BARTHÉLEMY	Saint Barthélemy	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sh	shn	654	SAINT HELENA	Saint Helena	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
kn	kna	659	SAINT KITTS AND NEVIS	Saint Kitts and Nevis	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
lc	lca	662	SAINT LUCIA	Saint Lucia	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
mf	maf	663	SAINT MARTIN (FRENCH PART)	Saint Martin (French part)	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
pm	spm	666	SAINT PIERRE AND MIQUELON	Saint Pierre and Miquelon	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
vc	vct	670	SAINT VINCENT AND THE GRENADINES	Saint Vincent and the Grenadines	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ws	wsm	882	SAMOA	Samoa	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sm	smr	674	SAN MARINO	San Marino	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
st	stp	678	SAO TOME AND PRINCIPE	Sao Tome and Principe	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sa	sau	682	SAUDI ARABIA	Saudi Arabia	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sn	sen	686	SENEGAL	Senegal	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
rs	srb	688	SERBIA	Serbia	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sc	syc	690	SEYCHELLES	Seychelles	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sl	sle	694	SIERRA LEONE	Sierra Leone	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sg	sgp	702	SINGAPORE	Singapore	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sx	sxm	534	SINT MAARTEN	Sint Maarten	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sk	svk	703	SLOVAKIA	Slovakia	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
si	svn	705	SLOVENIA	Slovenia	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sb	slb	090	SOLOMON ISLANDS	Solomon Islands	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
so	som	706	SOMALIA	Somalia	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
za	zaf	710	SOUTH AFRICA	South Africa	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
gs	sgs	239	SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS	South Georgia and the South Sandwich Islands	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ss	ssd	728	SOUTH SUDAN	South Sudan	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
lk	lka	144	SRI LANKA	Sri Lanka	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sd	sdn	729	SUDAN	Sudan	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sr	sur	740	SURINAME	Suriname	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sj	sjm	744	SVALBARD AND JAN MAYEN	Svalbard and Jan Mayen	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sz	swz	748	SWAZILAND	Swaziland	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ch	che	756	SWITZERLAND	Switzerland	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
sy	syr	760	SYRIAN ARAB REPUBLIC	Syrian Arab Republic	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tw	twn	158	TAIWAN, PROVINCE OF CHINA	Taiwan, Province of China	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tj	tjk	762	TAJIKISTAN	Tajikistan	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tz	tza	834	TANZANIA, UNITED REPUBLIC OF	Tanzania, United Republic of	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
th	tha	764	THAILAND	Thailand	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tl	tls	626	TIMOR LESTE	Timor Leste	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tg	tgo	768	TOGO	Togo	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tk	tkl	772	TOKELAU	Tokelau	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
to	ton	776	TONGA	Tonga	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tt	tto	780	TRINIDAD AND TOBAGO	Trinidad and Tobago	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tn	tun	788	TUNISIA	Tunisia	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tr	tur	792	TURKEY	Turkey	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tm	tkm	795	TURKMENISTAN	Turkmenistan	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tc	tca	796	TURKS AND CAICOS ISLANDS	Turks and Caicos Islands	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
tv	tuv	798	TUVALU	Tuvalu	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ug	uga	800	UGANDA	Uganda	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ua	ukr	804	UKRAINE	Ukraine	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ae	are	784	UNITED ARAB EMIRATES	United Arab Emirates	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
um	umi	581	UNITED STATES MINOR OUTLYING ISLANDS	United States Minor Outlying Islands	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
uy	ury	858	URUGUAY	Uruguay	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
uz	uzb	860	UZBEKISTAN	Uzbekistan	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
vu	vut	548	VANUATU	Vanuatu	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ve	ven	862	VENEZUELA	Venezuela	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
vn	vnm	704	VIET NAM	Viet Nam	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
vg	vgb	092	VIRGIN ISLANDS, BRITISH	Virgin Islands, British	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
vi	vir	850	VIRGIN ISLANDS, U.S.	Virgin Islands, U.S.	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
wf	wlf	876	WALLIS AND FUTUNA	Wallis and Futuna	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
eh	esh	732	WESTERN SAHARA	Western Sahara	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ye	yem	887	YEMEN	Yemen	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
zm	zmb	894	ZAMBIA	Zambia	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
zw	zwe	716	ZIMBABWE	Zimbabwe	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
ax	ala	248	ÅLAND ISLANDS	Åland Islands	\N	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:24.809+00	\N
dk	dnk	208	DENMARK	Denmark	reg_01KKS0NX3SA64NJ3XV501K8DX9	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:50.182+00	\N
fr	fra	250	FRANCE	France	reg_01KKS0NX3SA64NJ3XV501K8DX9	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:50.182+00	\N
de	deu	276	GERMANY	Germany	reg_01KKS0NX3SA64NJ3XV501K8DX9	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:50.182+00	\N
it	ita	380	ITALY	Italy	reg_01KKS0NX3SA64NJ3XV501K8DX9	\N	2026-03-15 15:08:24.807+00	2026-03-15 15:08:50.182+00	\N
es	esp	724	SPAIN	Spain	reg_01KKS0NX3SA64NJ3XV501K8DX9	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:50.182+00	\N
se	swe	752	SWEDEN	Sweden	reg_01KKS0NX3SA64NJ3XV501K8DX9	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:50.182+00	\N
gb	gbr	826	UNITED KINGDOM	United Kingdom	reg_01KKS0NX3SA64NJ3XV501K8DX9	\N	2026-03-15 15:08:24.809+00	2026-03-15 15:08:50.182+00	\N
us	usa	840	UNITED STATES	United States	reg_01KMR2KKDP7ZBBVMJJ56BJBR3X	\N	2026-03-15 15:08:24.809+00	2026-03-27 16:38:59.268+00	\N
\.


--
-- TOC entry 5293 (class 0 OID 17313)
-- Dependencies: 332
-- Data for Name: region_payment_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.region_payment_provider (region_id, payment_provider_id, id, created_at, updated_at, deleted_at) FROM stdin;
reg_01KKS0NX3SA64NJ3XV501K8DX9	pp_system_default	regpp_01KKS0NX57QF01C8YJ1MCJCQJE	2026-03-15 15:08:50.214963+00	2026-03-15 15:08:50.214963+00	\N
reg_01KMR2KKDP7ZBBVMJJ56BJBR3X	pp_system_default	regpp_01KMR2KKF7TAPCFNHSESJH2YMN	2026-03-27 16:38:59.301861+00	2026-03-27 16:38:59.301861+00	\N
\.


--
-- TOC entry 5294 (class 0 OID 17320)
-- Dependencies: 333
-- Data for Name: reservation_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservation_item (id, created_at, updated_at, deleted_at, line_item_id, location_id, quantity, external_id, description, created_by, metadata, inventory_item_id, allow_backorder, raw_quantity) FROM stdin;
resitem_01KMAZ34KYR4P6AA3CQED7PKM3	2026-03-22 14:27:26.472+00	2026-03-22 14:27:26.472+00	\N	ordli_01KMAZ34EMJB2FB9Q5N3XFH68W	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK5EBVCGBYF1Y95VN34	f	{"value": "1", "precision": 20}
resitem_01KMAZ34KZ2R0JBRV4YMM712Q8	2026-03-22 14:27:26.473+00	2026-03-22 14:27:26.473+00	\N	ordli_01KMAZ34ENCS1EA033KTBFHNYA	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK4186ZE627VQM4W9DS	f	{"value": "1", "precision": 20}
resitem_01KMAZMFW53SXXEA889J8GTP6J	2026-03-22 14:36:55.06+00	2026-03-22 14:36:55.06+00	\N	ordli_01KMAZMFQRPHK9CBPBJ7W0RD4G	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK4186ZE627VQM4W9DS	f	{"value": "1", "precision": 20}
resitem_01KMB0B0RV1FBHJW1HYHEXY4K9	2026-03-22 14:49:13.25+00	2026-03-22 14:49:13.25+00	\N	ordli_01KMB0B0MM5AYZWVKQAT6SV5A8	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK4GDJFR4Y8M2WJQMPG	f	{"value": "1", "precision": 20}
resitem_01KMDPT0Z91SE6BAWRNACN7ZYE	2026-03-23 16:00:22.515+00	2026-03-23 16:00:22.515+00	\N	ordli_01KMDPT0TDM9852KNYSKPRV01Y	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK5EBVCGBYF1Y95VN34	f	{"value": "1", "precision": 20}
resitem_01KMR318EK9VCMQEB16GSW80TE	2026-03-27 16:46:26.784+00	2026-03-27 16:46:26.784+00	\N	ordli_01KMR318AAQDRJNKNDANTS7Y6N	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK5B0T0EE57TJ5WM8A8	f	{"value": "1", "precision": 20}
resitem_01KMWT7X5JVDQ3JA1P1Y20579Z	2026-03-29 12:48:59.584+00	2026-03-29 12:48:59.584+00	\N	ordli_01KMWT7X1TT326EMH3KH10P3GE	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	8	\N	\N	\N	\N	iitem_01KKS0NXK5EBVCGBYF1Y95VN34	f	{"value": "8", "precision": 20}
resitem_01KMWWKPB13YP7MEXRKFTW6E7P	2026-03-29 13:30:22.957+00	2026-03-29 13:30:22.957+00	\N	ordli_01KMWWKP67Z4YKC5X2VS44DEWX	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	8	\N	\N	\N	\N	iitem_01KKS0NXK5EBVCGBYF1Y95VN34	f	{"value": "8", "precision": 20}
resitem_01KMWWKPB17NCVVVQHP42KXN5E	2026-03-29 13:30:22.957+00	2026-03-29 13:30:22.957+00	\N	ordli_01KMWWKP68E5SV532JY36E0GP8	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	6	\N	\N	\N	\N	iitem_01KKS0NXK500RPZ4VD6VTV4KGN	f	{"value": "6", "precision": 20}
resitem_01KMWWKPB1HWJS0Y7CBMFCKQG8	2026-03-29 13:30:22.957+00	2026-03-29 13:30:22.957+00	\N	ordli_01KMWWKP68HWEQVVHFFDVPYXJ8	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK5KZCDPB4XQNG9WMAK	f	{"value": "1", "precision": 20}
resitem_01KMWWKPB2HWF4CAKJH9DSS106	2026-03-29 13:30:22.957+00	2026-03-29 13:30:22.957+00	\N	ordli_01KMWWKP68KZ3CYKNPCYRKR82N	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK56M41XVZPG3CTWXQB	f	{"value": "1", "precision": 20}
resitem_01KNEVF4J73XJY1K2PGE2D0BVF	2026-04-05 12:56:44.883+00	2026-04-05 12:56:44.883+00	\N	ordli_01KNEVF4EY0GJXSE1GJFWB51BC	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK49C9HTJ2XZTS0EKPA	f	{"value": "1", "precision": 20}
resitem_01KNEVF4J7MR0NDBC2KWKAJTD3	2026-04-05 12:56:44.884+00	2026-04-05 12:56:44.884+00	\N	ordli_01KNEVF4EZSYEND0PW1PYXSBER	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	1	\N	\N	\N	\N	iitem_01KKS0NXK5HZKVWKVHR1YMM4HK	f	{"value": "1", "precision": 20}
\.


--
-- TOC entry 5295 (class 0 OID 17328)
-- Dependencies: 334
-- Data for Name: return; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return (id, order_id, claim_id, exchange_id, order_version, display_id, status, no_notification, refund_amount, raw_refund_amount, metadata, created_at, updated_at, deleted_at, received_at, canceled_at, location_id, requested_at, created_by) FROM stdin;
\.


--
-- TOC entry 5297 (class 0 OID 17337)
-- Dependencies: 336
-- Data for Name: return_fulfillment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_fulfillment (return_id, fulfillment_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5298 (class 0 OID 17344)
-- Dependencies: 337
-- Data for Name: return_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_item (id, return_id, reason_id, item_id, quantity, raw_quantity, received_quantity, raw_received_quantity, note, metadata, created_at, updated_at, deleted_at, damaged_quantity, raw_damaged_quantity) FROM stdin;
\.


--
-- TOC entry 5299 (class 0 OID 17355)
-- Dependencies: 338
-- Data for Name: return_reason; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_reason (id, value, label, description, metadata, parent_return_reason_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5300 (class 0 OID 17362)
-- Dependencies: 339
-- Data for Name: sales_channel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_channel (id, name, description, is_disabled, metadata, created_at, updated_at, deleted_at) FROM stdin;
sc_01KKS0NJHVM2S73KTPZF792K8F	Default Sales Channel	Created by Medusa	f	\N	2026-03-15 15:08:39.356+00	2026-03-15 15:08:39.356+00	\N
\.


--
-- TOC entry 5301 (class 0 OID 17370)
-- Dependencies: 340
-- Data for Name: sales_channel_stock_location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_channel_stock_location (sales_channel_id, stock_location_id, id, created_at, updated_at, deleted_at) FROM stdin;
sc_01KKS0NJHVM2S73KTPZF792K8F	sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	scloc_01KKS0NXCYSYFM5S81JERTDBFR	2026-03-15 15:08:50.462703+00	2026-03-15 15:08:50.462703+00	\N
\.


--
-- TOC entry 5302 (class 0 OID 17377)
-- Dependencies: 341
-- Data for Name: script_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.script_migrations (id, script_name, created_at, finished_at) FROM stdin;
1	migrate-product-shipping-profile.js	2026-03-15 15:08:27.685775+00	2026-03-15 15:08:27.731187+00
2	migrate-tax-region-provider.js	2026-03-15 15:08:27.736902+00	2026-03-15 15:08:27.750154+00
\.


--
-- TOC entry 5304 (class 0 OID 17382)
-- Dependencies: 343
-- Data for Name: service_zone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_zone (id, name, metadata, fulfillment_set_id, created_at, updated_at, deleted_at) FROM stdin;
serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	Europe	\N	fuset_01KKS0NX7TQC2MQRKB74P3VNNP	2026-03-15 15:08:50.299+00	2026-03-15 15:08:50.299+00	\N
\.


--
-- TOC entry 5305 (class 0 OID 17389)
-- Dependencies: 344
-- Data for Name: shipping_option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_option (id, name, price_type, service_zone_id, shipping_profile_id, provider_id, data, metadata, shipping_option_type_id, created_at, updated_at, deleted_at) FROM stdin;
so_01KKS0NXAAGF840G2QZAQZNA4P	Standard Shipping	flat	serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	sp_01KKS0N76BHWM622Y5CCGWFH2D	manual_manual	\N	\N	sotype_01KKS0NXA9S2WNPGRGMBNBH5C2	2026-03-15 15:08:50.379+00	2026-03-15 15:08:50.379+00	\N
so_01KKS0NXAAJFQNH1M6SF2AKH2V	Express Shipping	flat	serzo_01KKS0NX7TTVRFGAMZ3P3R5FB4	sp_01KKS0N76BHWM622Y5CCGWFH2D	manual_manual	\N	\N	sotype_01KKS0NXAARQEF6WSYQPTW84XV	2026-03-15 15:08:50.38+00	2026-03-15 15:08:50.38+00	\N
\.


--
-- TOC entry 5306 (class 0 OID 17398)
-- Dependencies: 345
-- Data for Name: shipping_option_price_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_option_price_set (shipping_option_id, price_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
so_01KKS0NXAAGF840G2QZAQZNA4P	pset_01KKS0NXB4CEMBZTXSG36XG426	sops_01KKS0NXCJDMPKACB9FFQXJ5XM	2026-03-15 15:08:50.45057+00	2026-03-15 15:08:50.45057+00	\N
so_01KKS0NXAAJFQNH1M6SF2AKH2V	pset_01KKS0NXB5YSE6M5SAQ8A95MN5	sops_01KKS0NXCKAPCJ7YNMCX022SXW	2026-03-15 15:08:50.45057+00	2026-03-15 15:08:50.45057+00	\N
\.


--
-- TOC entry 5307 (class 0 OID 17405)
-- Dependencies: 346
-- Data for Name: shipping_option_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_option_rule (id, attribute, operator, value, shipping_option_id, created_at, updated_at, deleted_at) FROM stdin;
sorul_01KKS0NXA9S0HWTVF3YXGP9BD0	enabled_in_store	eq	"true"	so_01KKS0NXAAGF840G2QZAQZNA4P	2026-03-15 15:08:50.38+00	2026-03-15 15:08:50.38+00	\N
sorul_01KKS0NXA93RK8BS21QF9MKZ3X	is_return	eq	"false"	so_01KKS0NXAAGF840G2QZAQZNA4P	2026-03-15 15:08:50.38+00	2026-03-15 15:08:50.38+00	\N
sorul_01KKS0NXAAJB5YEFVMKQ57XSJH	enabled_in_store	eq	"true"	so_01KKS0NXAAJFQNH1M6SF2AKH2V	2026-03-15 15:08:50.38+00	2026-03-15 15:08:50.38+00	\N
sorul_01KKS0NXAACAND7KTZD4Z7P1PF	is_return	eq	"false"	so_01KKS0NXAAJFQNH1M6SF2AKH2V	2026-03-15 15:08:50.38+00	2026-03-15 15:08:50.38+00	\N
\.


--
-- TOC entry 5308 (class 0 OID 17413)
-- Dependencies: 347
-- Data for Name: shipping_option_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_option_type (id, label, description, code, created_at, updated_at, deleted_at) FROM stdin;
sotype_01KKS0NXA9S2WNPGRGMBNBH5C2	Standard	Ship in 2-3 days.	standard	2026-03-15 15:08:50.379+00	2026-03-15 15:08:50.379+00	\N
sotype_01KKS0NXAARQEF6WSYQPTW84XV	Express	Ship in 24 hours.	express	2026-03-15 15:08:50.38+00	2026-03-15 15:08:50.38+00	\N
\.


--
-- TOC entry 5309 (class 0 OID 17420)
-- Dependencies: 348
-- Data for Name: shipping_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_profile (id, name, type, metadata, created_at, updated_at, deleted_at) FROM stdin;
sp_01KKS0N76BHWM622Y5CCGWFH2D	Default Shipping Profile	default	\N	2026-03-15 15:08:27.724+00	2026-03-15 15:08:27.724+00	\N
\.


--
-- TOC entry 5310 (class 0 OID 17427)
-- Dependencies: 349
-- Data for Name: stock_location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_location (id, created_at, updated_at, deleted_at, name, address_id, metadata) FROM stdin;
sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z	2026-03-15 15:08:50.255+00	2026-03-15 15:08:50.255+00	\N	European Warehouse	laddr_01KKS0NX6EAKRD801TV4782T9V	\N
sloc_01KM3CFSNZZGHBWJB90XMFQ0S4	2026-03-19 15:47:37.279+00	2026-03-19 15:47:37.279+00	\N	European Warehouse	laddr_01KM3CFSNZVWPKGZREQZ034T9A	\N
sloc_01KM3CPMM63G7830NJVGR3J8X7	2026-03-19 15:51:21.479+00	2026-03-19 15:51:21.479+00	\N	European Warehouse	laddr_01KM3CPMM59EHR1CXATNV31NXX	\N
sloc_01KM3CW27X1F33JCWVSTPQKK36	2026-03-19 15:54:19.262+00	2026-03-19 15:54:19.262+00	\N	European Warehouse	laddr_01KM3CW27X1GVC8SS8GJKFGSF4	\N
\.


--
-- TOC entry 5311 (class 0 OID 17434)
-- Dependencies: 350
-- Data for Name: stock_location_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_location_address (id, created_at, updated_at, deleted_at, address_1, address_2, company, city, country_code, phone, province, postal_code, metadata) FROM stdin;
laddr_01KKS0NX6EAKRD801TV4782T9V	2026-03-15 15:08:50.255+00	2026-03-15 15:08:50.255+00	\N		\N	\N	Copenhagen	DK	\N	\N	\N	\N
laddr_01KM3CFSNZVWPKGZREQZ034T9A	2026-03-19 15:47:37.279+00	2026-03-19 15:47:37.279+00	\N		\N	\N	Copenhagen	DK	\N	\N	\N	\N
laddr_01KM3CPMM59EHR1CXATNV31NXX	2026-03-19 15:51:21.478+00	2026-03-19 15:51:21.478+00	\N		\N	\N	Copenhagen	DK	\N	\N	\N	\N
laddr_01KM3CW27X1GVC8SS8GJKFGSF4	2026-03-19 15:54:19.261+00	2026-03-19 15:54:19.261+00	\N		\N	\N	Copenhagen	DK	\N	\N	\N	\N
\.


--
-- TOC entry 5312 (class 0 OID 17441)
-- Dependencies: 351
-- Data for Name: store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store (id, name, default_sales_channel_id, default_region_id, default_location_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
store_01KKS0NJJJ0ECQ0CJ9AVXF1YRT	Medusa Store	sc_01KKS0NJHVM2S73KTPZF792K8F	\N	sloc_01KM3CW27X1F33JCWVSTPQKK36	\N	2026-03-15 15:08:39.376008+00	2026-03-15 15:08:39.376008+00	\N
\.


--
-- TOC entry 5313 (class 0 OID 17449)
-- Dependencies: 352
-- Data for Name: store_currency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_currency (id, currency_code, is_default, store_id, created_at, updated_at, deleted_at) FROM stdin;
stocur_01KMR1J7XTE0YX2BVFST29AE5A	eur	f	store_01KKS0NJJJ0ECQ0CJ9AVXF1YRT	2026-03-27 16:20:46.12502+00	2026-03-27 16:20:46.12502+00	\N
stocur_01KMR1J7XTA2M5F7C77TFN1V52	usd	t	store_01KKS0NJJJ0ECQ0CJ9AVXF1YRT	2026-03-27 16:20:46.12502+00	2026-03-27 16:20:46.12502+00	\N
\.


--
-- TOC entry 5314 (class 0 OID 17457)
-- Dependencies: 353
-- Data for Name: store_locale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_locale (id, locale_code, store_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5315 (class 0 OID 17464)
-- Dependencies: 354
-- Data for Name: tax_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
tp_system	t	2026-03-15 15:08:24.947+00	2026-03-15 15:08:24.947+00	\N
\.


--
-- TOC entry 5316 (class 0 OID 17472)
-- Dependencies: 355
-- Data for Name: tax_rate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_rate (id, rate, code, name, is_default, is_combinable, tax_region_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- TOC entry 5317 (class 0 OID 17481)
-- Dependencies: 356
-- Data for Name: tax_rate_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_rate_rule (id, tax_rate_id, reference_id, reference, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- TOC entry 5318 (class 0 OID 17488)
-- Dependencies: 357
-- Data for Name: tax_region; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_region (id, provider_id, country_code, province_code, parent_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
txreg_01KKS0NX5STS7AB7DSW4T3ENEE	tp_system	gb	\N	\N	\N	2026-03-15 15:08:50.233+00	2026-03-15 15:08:50.234+00	\N	\N
txreg_01KKS0NX5S8260S8K40S23FWPN	tp_system	de	\N	\N	\N	2026-03-15 15:08:50.234+00	2026-03-15 15:08:50.234+00	\N	\N
txreg_01KKS0NX5SVVAXHYCNX2ZHTJR9	tp_system	dk	\N	\N	\N	2026-03-15 15:08:50.234+00	2026-03-15 15:08:50.234+00	\N	\N
txreg_01KKS0NX5SFRZGAXXYF9646JKZ	tp_system	se	\N	\N	\N	2026-03-15 15:08:50.234+00	2026-03-15 15:08:50.234+00	\N	\N
txreg_01KKS0NX5SBFWQHB60GR6VCNE0	tp_system	fr	\N	\N	\N	2026-03-15 15:08:50.234+00	2026-03-15 15:08:50.234+00	\N	\N
txreg_01KKS0NX5STSPAJ33G7C6DSGEE	tp_system	es	\N	\N	\N	2026-03-15 15:08:50.234+00	2026-03-15 15:08:50.234+00	\N	\N
txreg_01KKS0NX5SQ69NJ005XJZDN030	tp_system	it	\N	\N	\N	2026-03-15 15:08:50.234+00	2026-03-15 15:08:50.234+00	\N	\N
\.


--
-- TOC entry 5319 (class 0 OID 17497)
-- Dependencies: 358
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, first_name, last_name, email, avatar_url, metadata, created_at, updated_at, deleted_at) FROM stdin;
user_01KKS0RH3WM7X6EFJVZF65TP4F	lin	zhiqiang	1913045515@qq.com	\N	\N	2026-03-15 15:10:16.188+00	2026-03-15 15:10:16.189+00	\N
\.


--
-- TOC entry 5320 (class 0 OID 17504)
-- Dependencies: 359
-- Data for Name: user_preference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preference (id, user_id, key, value, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5321 (class 0 OID 17511)
-- Dependencies: 360
-- Data for Name: user_rbac_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_rbac_role (user_id, rbac_role_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5322 (class 0 OID 17518)
-- Dependencies: 361
-- Data for Name: view_configuration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.view_configuration (id, entity, name, user_id, is_system_default, configuration, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5323 (class 0 OID 17526)
-- Dependencies: 362
-- Data for Name: workflow_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_execution (id, workflow_id, transaction_id, execution, context, state, created_at, updated_at, deleted_at, retention_time, run_id) FROM stdin;
wf_exec_01KNEVF4C53EC5V89YAD32YJMP	complete-cart	auto-01KNEVF4BXV4ABX74X2AF2H3DZ	{"_v": 0, "runId": "01KNEVF4BZTKFFDG4Y65ZPW46V", "state": "done", "steps": {"_root": {"id": "_root", "next": ["_root.acquire-lock-step"]}, "_root.acquire-lock-step": {"_v": 0, "id": "_root.acquire-lock-step", "next": ["_root.acquire-lock-step.use-query-graph-step", "_root.acquire-lock-step.cart-query"], "uuid": "01KNA74H1KSD8C3CQBTFNAEFTB", "depth": 1, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804688, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1KSD8C3CQBTFNAEFTB", "store": false, "action": "acquire-lock-step", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804688, "saveResponse": true}, "_root.acquire-lock-step.cart-query": {"_v": 0, "id": "_root.acquire-lock-step.cart-query", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments"], "uuid": "01KNA74H1K0JCZNSSJ88HT0X3X", "depth": 2, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804690, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1K0JCZNSSJ88HT0X3X", "async": false, "store": false, "action": "cart-query", "noCompensation": true, "compensateAsync": false}, "stepFailed": false, "lastAttempt": 1775393804690, "saveResponse": true}, "_root.acquire-lock-step.use-query-graph-step": {"_v": 0, "id": "_root.acquire-lock-step.use-query-graph-step", "next": [], "uuid": "01KNA74H1KAXEED5KBR0PEY9MS", "depth": 2, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804690, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1KAXEED5KBR0PEY9MS", "store": false, "action": "use-query-graph-step", "noCompensation": true}, "stepFailed": false, "lastAttempt": 1775393804690, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed"], "uuid": "01KNA74H1KT2PA7SHVFRAQ1ND1", "depth": 3, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804736, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1KT2PA7SHVFRAQ1ND1", "store": false, "action": "validate-cart-payments", "noCompensation": true}, "stepFailed": false, "lastAttempt": 1775393804736, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate"], "uuid": "01KNA74H1M33TXTGBA5S2X6V70", "depth": 4, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804740, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1M33TXTGBA5S2X6V70", "store": false, "action": "compensate-payment-if-needed", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804740, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query"], "uuid": "01KNA74H1MDJ63PXV76PDGZ9X9", "depth": 5, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804743, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1MDJ63PXV76PDGZ9X9", "store": false, "action": "validate", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804743, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping"], "uuid": "01KNA74H1N2CP4WKDT0C3841H3", "depth": 6, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804747, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1N2CP4WKDT0C3841H3", "async": false, "store": false, "action": "shipping-options-query", "noCompensation": true, "compensateAsync": false}, "stepFailed": false, "lastAttempt": 1775393804747, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders"], "uuid": "01KNA74H1NB4CV9VKFY9V5P33N", "depth": 7, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804753, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1NB4CV9VKFY9V5P33N", "store": false, "action": "validate-shipping", "noCompensation": true}, "stepFailed": false, "lastAttempt": 1775393804753, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.create-remote-links", "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.update-carts", "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.reserve-inventory-step", "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.register-usage", "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step"], "uuid": "01KNA74H1PTH5CHVK2J69NPACD", "depth": 8, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804757, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1PTH5CHVK2J69NPACD", "store": false, "action": "create-orders", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804757, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.update-carts": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.update-carts", "next": [], "uuid": "01KNA74H1P79A71BAGP1E9DDC4", "depth": 9, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804836, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1P79A71BAGP1E9DDC4", "store": false, "action": "update-carts", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804836, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.register-usage": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.register-usage", "next": [], "uuid": "01KNA74H1PWSVBBEM4D98R00RY", "depth": 9, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804836, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1PWSVBBEM4D98R00RY", "store": false, "action": "register-usage", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804836, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization"], "uuid": "01KNA74H1QD9BXDC686A7WAW1Q", "depth": 9, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804836, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1QD9BXDC686A7WAW1Q", "store": false, "action": "emit-event-step", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804836, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.create-remote-links": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.create-remote-links", "next": [], "uuid": "01KNA74H1P526M8VTVVR1QP17P", "depth": 9, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804836, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1P526M8VTVVR1QP17P", "store": false, "action": "create-remote-links", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804836, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.reserve-inventory-step": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.reserve-inventory-step", "next": [], "uuid": "01KNA74H1P0Y963FJ5E2KGBJE6", "depth": 9, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804836, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1P0Y963FJ5E2KGBJE6", "store": false, "action": "reserve-inventory-step", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804836, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step"], "uuid": "01KNA74H1QM7ZXRYWQ17N5NNSW", "depth": 10, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804904, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1QM7ZXRYWQ17N5NNSW", "store": false, "action": "beforePaymentAuthorization", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804904, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction"], "uuid": "01KNA74H1QAE2APQPBKGQH7VAR", "depth": 11, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804907, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1QAE2APQPBKGQH7VAR", "store": false, "action": "authorize-payment-session-step", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804907, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction.orderCreated"], "uuid": "01KNA74H1R4A97Y87KVWXYPMKT", "depth": 12, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804955, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1R4A97Y87KVWXYPMKT", "store": false, "action": "add-order-transaction", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804955, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction.orderCreated": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction.orderCreated", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction.orderCreated.create-order"], "uuid": "01KNA74H1RH6MK4GAX1P619G1J", "depth": 13, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804960, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1RH6MK4GAX1P619G1J", "store": false, "action": "orderCreated", "noCompensation": false}, "stepFailed": false, "lastAttempt": 1775393804960, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction.orderCreated.create-order": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction.orderCreated.create-order", "next": ["_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction.orderCreated.create-order.release-lock-step"], "uuid": "01KNA74H1RRY3MV5656RDH77YH", "depth": 14, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804964, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1RRY3MV5656RDH77YH", "store": false, "action": "create-order", "noCompensation": true}, "stepFailed": false, "lastAttempt": 1775393804964, "saveResponse": true}, "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction.orderCreated.create-order.release-lock-step": {"_v": 0, "id": "_root.acquire-lock-step.cart-query.validate-cart-payments.compensate-payment-if-needed.validate.shipping-options-query.validate-shipping.create-orders.emit-event-step.beforePaymentAuthorization.authorize-payment-session-step.add-order-transaction.orderCreated.create-order.release-lock-step", "next": [], "uuid": "01KNA74H1RSZKSXCXMQ4HSQ60A", "depth": 15, "invoke": {"state": "done", "status": "ok"}, "attempts": 1, "failures": 0, "startedAt": 1775393804968, "compensate": {"state": "dormant", "status": "idle"}, "definition": {"uuid": "01KNA74H1RSZKSXCXMQ4HSQ60A", "store": false, "action": "release-lock-step", "noCompensation": true}, "stepFailed": false, "lastAttempt": 1775393804968, "saveResponse": true}}, "modelId": "complete-cart", "options": {"name": "complete-cart", "store": true, "idempotent": false, "retentionTime": 259200}, "metadata": {"sourcePath": "/app/node_modules/@medusajs/core-flows/dist/cart/workflows/complete-cart.js", "eventGroupId": "01KNEVF4BXXC5XJX085A46NGPG", "preventReleaseEvents": false}, "startedAt": 1775393804687, "definition": {"next": [{"uuid": "01KNA74H1KAXEED5KBR0PEY9MS", "action": "use-query-graph-step", "noCompensation": true}, {"next": {"next": {"next": {"next": {"next": {"next": {"next": [{"uuid": "01KNA74H1P526M8VTVVR1QP17P", "action": "create-remote-links", "noCompensation": false}, {"uuid": "01KNA74H1P79A71BAGP1E9DDC4", "action": "update-carts", "noCompensation": false}, {"uuid": "01KNA74H1P0Y963FJ5E2KGBJE6", "action": "reserve-inventory-step", "noCompensation": false}, {"uuid": "01KNA74H1PWSVBBEM4D98R00RY", "action": "register-usage", "noCompensation": false}, {"next": {"next": {"next": {"next": {"next": {"next": {"uuid": "01KNA74H1RSZKSXCXMQ4HSQ60A", "action": "release-lock-step", "noCompensation": true}, "uuid": "01KNA74H1RRY3MV5656RDH77YH", "action": "create-order", "noCompensation": true}, "uuid": "01KNA74H1RH6MK4GAX1P619G1J", "action": "orderCreated", "noCompensation": false}, "uuid": "01KNA74H1R4A97Y87KVWXYPMKT", "action": "add-order-transaction", "noCompensation": false}, "uuid": "01KNA74H1QAE2APQPBKGQH7VAR", "action": "authorize-payment-session-step", "noCompensation": false}, "uuid": "01KNA74H1QM7ZXRYWQ17N5NNSW", "action": "beforePaymentAuthorization", "noCompensation": false}, "uuid": "01KNA74H1QD9BXDC686A7WAW1Q", "action": "emit-event-step", "noCompensation": false}], "uuid": "01KNA74H1PTH5CHVK2J69NPACD", "action": "create-orders", "noCompensation": false}, "uuid": "01KNA74H1NB4CV9VKFY9V5P33N", "action": "validate-shipping", "noCompensation": true}, "uuid": "01KNA74H1N2CP4WKDT0C3841H3", "async": false, "action": "shipping-options-query", "noCompensation": true, "compensateAsync": false}, "uuid": "01KNA74H1MDJ63PXV76PDGZ9X9", "action": "validate", "noCompensation": false}, "uuid": "01KNA74H1M33TXTGBA5S2X6V70", "action": "compensate-payment-if-needed", "noCompensation": false}, "uuid": "01KNA74H1KT2PA7SHVFRAQ1ND1", "action": "validate-cart-payments", "noCompensation": true}, "uuid": "01KNA74H1K0JCZNSSJ88HT0X3X", "async": false, "action": "cart-query", "noCompensation": true, "compensateAsync": false}], "uuid": "01KNA74H1KSD8C3CQBTFNAEFTB", "action": "acquire-lock-step", "noCompensation": false}, "timedOutAt": null, "hasAsyncSteps": false, "transactionId": "auto-01KNEVF4BXV4ABX74X2AF2H3DZ", "hasFailedSteps": false, "hasSkippedSteps": false, "hasWaitingSteps": false, "hasRevertedSteps": false, "hasSkippedOnFailureSteps": false}	{"data": {"invoke": {"validate": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)"}}, "cart-query": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": {"data": {"id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "email": "208017534@qq.com", "items": [{"id": "cali_01KNEVD3M87VDK8X5BQ1QESSMR", "title": "Medusa Sweatshirt", "total": 10, "cart_id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "variant": {"id": "variant_01KKS0NXJ3G9VBA54CADHC4PFY", "product": {"id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB", "is_giftcard": false, "shipping_profile": {"id": "sp_01KKS0N76BHWM622Y5CCGWFH2D"}}, "product_id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB", "allow_backorder": false, "inventory_items": [{"inventory": {"id": "iitem_01KKS0NXK49C9HTJ2XZTS0EKPA", "location_levels": [{"location_id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "stock_locations": [{"id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "name": "European Warehouse", "sales_channels": [{"id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "name": "Default Sales Channel"}]}], "stocked_quantity": 1000000, "reserved_quantity": 0, "raw_stocked_quantity": {"value": "1000000", "precision": 20}, "raw_reserved_quantity": {"value": "0", "precision": 20}}], "requires_shipping": true}, "variant_id": "variant_01KKS0NXJ3G9VBA54CADHC4PFY", "inventory_item_id": "iitem_01KKS0NXK49C9HTJ2XZTS0EKPA", "required_quantity": 1}], "manage_inventory": true}, "metadata": {}, "quantity": 1, "subtitle": "S", "subtotal": 10, "raw_total": {"value": "10", "precision": 20}, "tax_lines": [], "tax_total": 0, "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png", "created_at": "2026-04-05T12:55:38.376Z", "deleted_at": null, "product_id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB", "unit_price": 10, "updated_at": "2026-04-05T12:56:22.400Z", "variant_id": "variant_01KKS0NXJ3G9VBA54CADHC4PFY", "adjustments": [], "is_giftcard": false, "variant_sku": "SWEATSHIRT-S", "product_type": null, "raw_subtotal": {"value": "10", "precision": 20}, "product_title": "Medusa Sweatshirt", "raw_tax_total": {"value": "0", "precision": 20}, "variant_title": "S", "discount_total": 0, "original_total": 10, "product_handle": "sweatshirt", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "discount_subtotal": 0, "original_subtotal": 10, "requires_shipping": true, "discount_tax_total": 0, "original_tax_total": 0, "product_collection": null, "raw_discount_total": {"value": "0", "precision": 20}, "raw_original_total": {"value": "10", "precision": 20}, "product_description": "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "raw_discount_subtotal": {"value": "0", "precision": 20}, "raw_original_subtotal": {"value": "10", "precision": 20}, "variant_option_values": null, "raw_discount_tax_total": {"value": "0", "precision": 20}, "raw_original_tax_total": {"value": "0", "precision": 20}, "raw_compare_at_unit_price": null}, {"id": "cali_01KNEVEEVEWASY7HVCH7VAYF65", "title": "Medusa Shorts", "total": 10, "cart_id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "variant": {"id": "variant_01KKS0NXJ468WFHB5JPG46TJHJ", "product": {"id": "prod_01KKS0NXERTEZQTGVZJHWQQM2A", "is_giftcard": false, "shipping_profile": {"id": "sp_01KKS0N76BHWM622Y5CCGWFH2D"}}, "product_id": "prod_01KKS0NXERTEZQTGVZJHWQQM2A", "allow_backorder": false, "inventory_items": [{"inventory": {"id": "iitem_01KKS0NXK5HZKVWKVHR1YMM4HK", "location_levels": [{"location_id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "stock_locations": [{"id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "name": "European Warehouse", "sales_channels": [{"id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "name": "Default Sales Channel"}]}], "stocked_quantity": 1000000, "reserved_quantity": 0, "raw_stocked_quantity": {"value": "1000000", "precision": 20}, "raw_reserved_quantity": {"value": "0", "precision": 20}}], "requires_shipping": true}, "variant_id": "variant_01KKS0NXJ468WFHB5JPG46TJHJ", "inventory_item_id": "iitem_01KKS0NXK5HZKVWKVHR1YMM4HK", "required_quantity": 1}], "manage_inventory": true}, "metadata": {}, "quantity": 1, "subtitle": "S", "subtotal": 10, "raw_total": {"value": "10", "precision": 20}, "tax_lines": [], "tax_total": 0, "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png", "created_at": "2026-04-05T12:56:22.639Z", "deleted_at": null, "product_id": "prod_01KKS0NXERTEZQTGVZJHWQQM2A", "unit_price": 10, "updated_at": "2026-04-05T12:56:22.639Z", "variant_id": "variant_01KKS0NXJ468WFHB5JPG46TJHJ", "adjustments": [], "is_giftcard": false, "variant_sku": "SHORTS-S", "product_type": null, "raw_subtotal": {"value": "10", "precision": 20}, "product_title": "Medusa Shorts", "raw_tax_total": {"value": "0", "precision": 20}, "variant_title": "S", "discount_total": 0, "original_total": 10, "product_handle": "shorts", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "discount_subtotal": 0, "original_subtotal": 10, "requires_shipping": true, "discount_tax_total": 0, "original_tax_total": 0, "product_collection": null, "raw_discount_total": {"value": "0", "precision": 20}, "raw_original_total": {"value": "10", "precision": 20}, "product_description": "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "raw_discount_subtotal": {"value": "0", "precision": 20}, "raw_original_subtotal": {"value": "10", "precision": 20}, "variant_option_values": null, "raw_discount_tax_total": {"value": "0", "precision": 20}, "raw_original_tax_total": {"value": "0", "precision": 20}, "raw_compare_at_unit_price": null}], "total": 30, "locale": null, "region": {"id": "reg_01KKS0NX3SA64NJ3XV501K8DX9", "name": "Europe", "metadata": null, "created_at": "2026-03-15T15:08:50.182Z", "deleted_at": null, "updated_at": "2026-03-15T15:08:50.182Z", "currency_code": "eur", "automatic_taxes": true}, "customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "last_name": "zhiqiang", "created_at": "2026-03-16T14:59:39.890Z", "created_by": null, "deleted_at": null, "first_name": "lin", "updated_at": "2026-03-16T14:59:39.890Z", "has_account": true, "company_name": null}, "metadata": null, "subtotal": 30, "raw_total": {"value": "30", "precision": 20}, "region_id": "reg_01KKS0NX3SA64NJ3XV501K8DX9", "tax_total": 0, "created_at": "2026-04-05T12:55:38.038Z", "item_total": 20, "promotions": [], "updated_at": "2026-04-05T12:56:35.100Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "completed_at": null, "credit_lines": [], "raw_subtotal": {"value": "30", "precision": 20}, "currency_code": "eur", "item_subtotal": 20, "raw_tax_total": {"value": "0", "precision": 20}, "discount_total": 0, "item_tax_total": 0, "original_total": 30, "raw_item_total": {"value": "20", "precision": 20}, "shipping_total": 10, "billing_address": {"id": "caaddr_01KNEVEV0VD278W65ZW3SXWYFT", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "sales_channel_id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "shipping_address": {"id": "caaddr_01KNEVEV0VNK4M24ZJG51VP80K", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "shipping_methods": [{"id": "casm_01KNEVEXA56RZJXDT6M08874SK", "data": {}, "name": "Standard Shipping", "total": 10, "amount": 10, "cart_id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "metadata": null, "subtotal": 10, "raw_total": {"value": "10", "precision": 20}, "tax_lines": [], "tax_total": 0, "created_at": "2026-04-05T12:56:37.445Z", "deleted_at": null, "raw_amount": {"value": "10", "precision": 20}, "updated_at": "2026-04-05T12:56:37.445Z", "adjustments": [], "description": null, "raw_subtotal": {"value": "10", "precision": 20}, "raw_tax_total": {"value": "0", "precision": 20}, "discount_total": 0, "original_total": 10, "is_tax_inclusive": false, "discount_subtotal": 0, "original_subtotal": 10, "discount_tax_total": 0, "original_tax_total": 0, "raw_discount_total": {"value": "0", "precision": 20}, "raw_original_total": {"value": "10", "precision": 20}, "shipping_option_id": "so_01KKS0NXAAGF840G2QZAQZNA4P", "raw_discount_subtotal": {"value": "0", "precision": 20}, "raw_original_subtotal": {"value": "10", "precision": 20}, "raw_discount_tax_total": {"value": "0", "precision": 20}, "raw_original_tax_total": {"value": "0", "precision": 20}}], "raw_item_subtotal": {"value": "20", "precision": 20}, "shipping_subtotal": 10, "discount_tax_total": 0, "original_tax_total": 0, "payment_collection": {"id": "pay_col_01KNEVF2CB25F0V0R409SP04B8", "amount": 30, "status": "not_paid", "metadata": null, "created_at": "2026-04-05T12:56:42.635Z", "deleted_at": null, "raw_amount": {"value": "30", "precision": 20}, "updated_at": "2026-04-05T12:56:42.635Z", "completed_at": null, "currency_code": "eur", "captured_amount": null, "refunded_amount": null, "payment_sessions": [{"id": "payses_01KNEVF2E5937P90AYH7QB722Q", "data": {}, "amount": 30, "status": "pending", "context": {"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [{"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}, {"id": "cuaddr_01KMR2WPG233CNE36V0TEY2T2M", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-03-27T16:43:57.314Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-03-27T16:43:57.314Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}], "billing_address": {"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}, "metadata": {}, "created_at": "2026-04-05T12:56:42.693Z", "deleted_at": null, "raw_amount": {"value": "30", "precision": 20}, "updated_at": "2026-04-05T12:56:42.693Z", "provider_id": "pp_system_default", "authorized_at": null, "currency_code": "eur", "payment_collection_id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}], "authorized_amount": null, "raw_captured_amount": null, "raw_refunded_amount": null, "raw_authorized_amount": null}, "raw_discount_total": {"value": "0", "precision": 20}, "raw_item_tax_total": {"value": "0", "precision": 20}, "raw_original_total": {"value": "30", "precision": 20}, "raw_shipping_total": {"value": "10", "precision": 20}, "shipping_tax_total": 0, "original_item_total": 20, "raw_shipping_subtotal": {"value": "10", "precision": 20}, "original_item_subtotal": 20, "raw_discount_tax_total": {"value": "0", "precision": 20}, "raw_original_tax_total": {"value": "0", "precision": 20}, "raw_shipping_tax_total": {"value": "0", "precision": 20}, "original_item_tax_total": 0, "original_shipping_total": 10, "raw_original_item_total": {"value": "20", "precision": 20}, "original_shipping_subtotal": 10, "raw_original_item_subtotal": {"value": "20", "precision": 20}, "original_shipping_tax_total": 0, "raw_original_item_tax_total": {"value": "0", "precision": 20}, "raw_original_shipping_total": {"value": "10", "precision": 20}, "raw_original_shipping_subtotal": {"value": "10", "precision": 20}, "raw_original_shipping_tax_total": {"value": "0", "precision": 20}}}, "compensateInput": {"data": {"id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "email": "208017534@qq.com", "items": [{"id": "cali_01KNEVD3M87VDK8X5BQ1QESSMR", "title": "Medusa Sweatshirt", "total": 10, "cart_id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "variant": {"id": "variant_01KKS0NXJ3G9VBA54CADHC4PFY", "product": {"id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB", "is_giftcard": false, "shipping_profile": {"id": "sp_01KKS0N76BHWM622Y5CCGWFH2D"}}, "product_id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB", "allow_backorder": false, "inventory_items": [{"inventory": {"id": "iitem_01KKS0NXK49C9HTJ2XZTS0EKPA", "location_levels": [{"location_id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "stock_locations": [{"id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "name": "European Warehouse", "sales_channels": [{"id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "name": "Default Sales Channel"}]}], "stocked_quantity": 1000000, "reserved_quantity": 0, "raw_stocked_quantity": {"value": "1000000", "precision": 20}, "raw_reserved_quantity": {"value": "0", "precision": 20}}], "requires_shipping": true}, "variant_id": "variant_01KKS0NXJ3G9VBA54CADHC4PFY", "inventory_item_id": "iitem_01KKS0NXK49C9HTJ2XZTS0EKPA", "required_quantity": 1}], "manage_inventory": true}, "metadata": {}, "quantity": 1, "subtitle": "S", "subtotal": 10, "raw_total": {"value": "10", "precision": 20}, "tax_lines": [], "tax_total": 0, "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png", "created_at": "2026-04-05T12:55:38.376Z", "deleted_at": null, "product_id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB", "unit_price": 10, "updated_at": "2026-04-05T12:56:22.400Z", "variant_id": "variant_01KKS0NXJ3G9VBA54CADHC4PFY", "adjustments": [], "is_giftcard": false, "variant_sku": "SWEATSHIRT-S", "product_type": null, "raw_subtotal": {"value": "10", "precision": 20}, "product_title": "Medusa Sweatshirt", "raw_tax_total": {"value": "0", "precision": 20}, "variant_title": "S", "discount_total": 0, "original_total": 10, "product_handle": "sweatshirt", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "discount_subtotal": 0, "original_subtotal": 10, "requires_shipping": true, "discount_tax_total": 0, "original_tax_total": 0, "product_collection": null, "raw_discount_total": {"value": "0", "precision": 20}, "raw_original_total": {"value": "10", "precision": 20}, "product_description": "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "raw_discount_subtotal": {"value": "0", "precision": 20}, "raw_original_subtotal": {"value": "10", "precision": 20}, "variant_option_values": null, "raw_discount_tax_total": {"value": "0", "precision": 20}, "raw_original_tax_total": {"value": "0", "precision": 20}, "raw_compare_at_unit_price": null}, {"id": "cali_01KNEVEEVEWASY7HVCH7VAYF65", "title": "Medusa Shorts", "total": 10, "cart_id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "variant": {"id": "variant_01KKS0NXJ468WFHB5JPG46TJHJ", "product": {"id": "prod_01KKS0NXERTEZQTGVZJHWQQM2A", "is_giftcard": false, "shipping_profile": {"id": "sp_01KKS0N76BHWM622Y5CCGWFH2D"}}, "product_id": "prod_01KKS0NXERTEZQTGVZJHWQQM2A", "allow_backorder": false, "inventory_items": [{"inventory": {"id": "iitem_01KKS0NXK5HZKVWKVHR1YMM4HK", "location_levels": [{"location_id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "stock_locations": [{"id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "name": "European Warehouse", "sales_channels": [{"id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "name": "Default Sales Channel"}]}], "stocked_quantity": 1000000, "reserved_quantity": 0, "raw_stocked_quantity": {"value": "1000000", "precision": 20}, "raw_reserved_quantity": {"value": "0", "precision": 20}}], "requires_shipping": true}, "variant_id": "variant_01KKS0NXJ468WFHB5JPG46TJHJ", "inventory_item_id": "iitem_01KKS0NXK5HZKVWKVHR1YMM4HK", "required_quantity": 1}], "manage_inventory": true}, "metadata": {}, "quantity": 1, "subtitle": "S", "subtotal": 10, "raw_total": {"value": "10", "precision": 20}, "tax_lines": [], "tax_total": 0, "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png", "created_at": "2026-04-05T12:56:22.639Z", "deleted_at": null, "product_id": "prod_01KKS0NXERTEZQTGVZJHWQQM2A", "unit_price": 10, "updated_at": "2026-04-05T12:56:22.639Z", "variant_id": "variant_01KKS0NXJ468WFHB5JPG46TJHJ", "adjustments": [], "is_giftcard": false, "variant_sku": "SHORTS-S", "product_type": null, "raw_subtotal": {"value": "10", "precision": 20}, "product_title": "Medusa Shorts", "raw_tax_total": {"value": "0", "precision": 20}, "variant_title": "S", "discount_total": 0, "original_total": 10, "product_handle": "shorts", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "discount_subtotal": 0, "original_subtotal": 10, "requires_shipping": true, "discount_tax_total": 0, "original_tax_total": 0, "product_collection": null, "raw_discount_total": {"value": "0", "precision": 20}, "raw_original_total": {"value": "10", "precision": 20}, "product_description": "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "raw_discount_subtotal": {"value": "0", "precision": 20}, "raw_original_subtotal": {"value": "10", "precision": 20}, "variant_option_values": null, "raw_discount_tax_total": {"value": "0", "precision": 20}, "raw_original_tax_total": {"value": "0", "precision": 20}, "raw_compare_at_unit_price": null}], "total": 30, "locale": null, "region": {"id": "reg_01KKS0NX3SA64NJ3XV501K8DX9", "name": "Europe", "metadata": null, "created_at": "2026-03-15T15:08:50.182Z", "deleted_at": null, "updated_at": "2026-03-15T15:08:50.182Z", "currency_code": "eur", "automatic_taxes": true}, "customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "last_name": "zhiqiang", "created_at": "2026-03-16T14:59:39.890Z", "created_by": null, "deleted_at": null, "first_name": "lin", "updated_at": "2026-03-16T14:59:39.890Z", "has_account": true, "company_name": null}, "metadata": null, "subtotal": 30, "raw_total": {"value": "30", "precision": 20}, "region_id": "reg_01KKS0NX3SA64NJ3XV501K8DX9", "tax_total": 0, "created_at": "2026-04-05T12:55:38.038Z", "item_total": 20, "promotions": [], "updated_at": "2026-04-05T12:56:35.100Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "completed_at": null, "credit_lines": [], "raw_subtotal": {"value": "30", "precision": 20}, "currency_code": "eur", "item_subtotal": 20, "raw_tax_total": {"value": "0", "precision": 20}, "discount_total": 0, "item_tax_total": 0, "original_total": 30, "raw_item_total": {"value": "20", "precision": 20}, "shipping_total": 10, "billing_address": {"id": "caaddr_01KNEVEV0VD278W65ZW3SXWYFT", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "sales_channel_id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "shipping_address": {"id": "caaddr_01KNEVEV0VNK4M24ZJG51VP80K", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "shipping_methods": [{"id": "casm_01KNEVEXA56RZJXDT6M08874SK", "data": {}, "name": "Standard Shipping", "total": 10, "amount": 10, "cart_id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "metadata": null, "subtotal": 10, "raw_total": {"value": "10", "precision": 20}, "tax_lines": [], "tax_total": 0, "created_at": "2026-04-05T12:56:37.445Z", "deleted_at": null, "raw_amount": {"value": "10", "precision": 20}, "updated_at": "2026-04-05T12:56:37.445Z", "adjustments": [], "description": null, "raw_subtotal": {"value": "10", "precision": 20}, "raw_tax_total": {"value": "0", "precision": 20}, "discount_total": 0, "original_total": 10, "is_tax_inclusive": false, "discount_subtotal": 0, "original_subtotal": 10, "discount_tax_total": 0, "original_tax_total": 0, "raw_discount_total": {"value": "0", "precision": 20}, "raw_original_total": {"value": "10", "precision": 20}, "shipping_option_id": "so_01KKS0NXAAGF840G2QZAQZNA4P", "raw_discount_subtotal": {"value": "0", "precision": 20}, "raw_original_subtotal": {"value": "10", "precision": 20}, "raw_discount_tax_total": {"value": "0", "precision": 20}, "raw_original_tax_total": {"value": "0", "precision": 20}}], "raw_item_subtotal": {"value": "20", "precision": 20}, "shipping_subtotal": 10, "discount_tax_total": 0, "original_tax_total": 0, "payment_collection": {"id": "pay_col_01KNEVF2CB25F0V0R409SP04B8", "amount": 30, "status": "not_paid", "metadata": null, "created_at": "2026-04-05T12:56:42.635Z", "deleted_at": null, "raw_amount": {"value": "30", "precision": 20}, "updated_at": "2026-04-05T12:56:42.635Z", "completed_at": null, "currency_code": "eur", "captured_amount": null, "refunded_amount": null, "payment_sessions": [{"id": "payses_01KNEVF2E5937P90AYH7QB722Q", "data": {}, "amount": 30, "status": "pending", "context": {"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [{"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}, {"id": "cuaddr_01KMR2WPG233CNE36V0TEY2T2M", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-03-27T16:43:57.314Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-03-27T16:43:57.314Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}], "billing_address": {"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}, "metadata": {}, "created_at": "2026-04-05T12:56:42.693Z", "deleted_at": null, "raw_amount": {"value": "30", "precision": 20}, "updated_at": "2026-04-05T12:56:42.693Z", "provider_id": "pp_system_default", "authorized_at": null, "currency_code": "eur", "payment_collection_id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}], "authorized_amount": null, "raw_captured_amount": null, "raw_refunded_amount": null, "raw_authorized_amount": null}, "raw_discount_total": {"value": "0", "precision": 20}, "raw_item_tax_total": {"value": "0", "precision": 20}, "raw_original_total": {"value": "30", "precision": 20}, "raw_shipping_total": {"value": "10", "precision": 20}, "shipping_tax_total": 0, "original_item_total": 20, "raw_shipping_subtotal": {"value": "10", "precision": 20}, "original_item_subtotal": 20, "raw_discount_tax_total": {"value": "0", "precision": 20}, "raw_original_tax_total": {"value": "0", "precision": 20}, "raw_shipping_tax_total": {"value": "0", "precision": 20}, "original_item_tax_total": 0, "original_shipping_total": 10, "raw_original_item_total": {"value": "20", "precision": 20}, "original_shipping_subtotal": 10, "raw_original_item_subtotal": {"value": "20", "precision": 20}, "original_shipping_tax_total": 0, "raw_original_item_tax_total": {"value": "0", "precision": 20}, "raw_original_shipping_total": {"value": "10", "precision": 20}, "raw_original_shipping_subtotal": {"value": "10", "precision": 20}, "raw_original_shipping_tax_total": {"value": "0", "precision": 20}}}}}, "create-order": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": {"id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "email": "208017534@qq.com", "items": [{"id": "ordli_01KNEVF4EY0GJXSE1GJFWB51BC", "title": "Medusa Sweatshirt", "detail": {"id": "orditem_01KNEVF4EZZ8WJYR5KAVYB8FY7", "item_id": "ordli_01KNEVF4EY0GJXSE1GJFWB51BC", "version": 1, "metadata": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "quantity": 1, "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "unit_price": null, "updated_at": "2026-04-05T12:56:44.769Z", "raw_quantity": {"value": "1", "precision": 20}, "raw_unit_price": null, "shipped_quantity": 0, "delivered_quantity": 0, "fulfilled_quantity": 0, "raw_shipped_quantity": {"value": "0", "precision": 20}, "written_off_quantity": 0, "compare_at_unit_price": null, "raw_delivered_quantity": {"value": "0", "precision": 20}, "raw_fulfilled_quantity": {"value": "0", "precision": 20}, "raw_written_off_quantity": {"value": "0", "precision": 20}, "return_received_quantity": 0, "raw_compare_at_unit_price": null, "return_dismissed_quantity": 0, "return_requested_quantity": 0, "raw_return_received_quantity": {"value": "0", "precision": 20}, "raw_return_dismissed_quantity": {"value": "0", "precision": 20}, "raw_return_requested_quantity": {"value": "0", "precision": 20}}, "metadata": {}, "quantity": 1, "subtitle": "S", "tax_lines": [], "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png", "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "product_id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB", "unit_price": 10, "updated_at": "2026-04-05T12:56:44.769Z", "variant_id": "variant_01KKS0NXJ3G9VBA54CADHC4PFY", "adjustments": [], "is_giftcard": false, "variant_sku": "SWEATSHIRT-S", "product_type": null, "raw_quantity": {"value": "1", "precision": 20}, "product_title": "Medusa Sweatshirt", "variant_title": "S", "product_handle": "sweatshirt", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "requires_shipping": true, "product_collection": null, "product_description": "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "variant_option_values": null, "raw_compare_at_unit_price": null}, {"id": "ordli_01KNEVF4EZSYEND0PW1PYXSBER", "title": "Medusa Shorts", "detail": {"id": "orditem_01KNEVF4EZB61JGBY943BNC7Y7", "item_id": "ordli_01KNEVF4EZSYEND0PW1PYXSBER", "version": 1, "metadata": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "quantity": 1, "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "unit_price": null, "updated_at": "2026-04-05T12:56:44.769Z", "raw_quantity": {"value": "1", "precision": 20}, "raw_unit_price": null, "shipped_quantity": 0, "delivered_quantity": 0, "fulfilled_quantity": 0, "raw_shipped_quantity": {"value": "0", "precision": 20}, "written_off_quantity": 0, "compare_at_unit_price": null, "raw_delivered_quantity": {"value": "0", "precision": 20}, "raw_fulfilled_quantity": {"value": "0", "precision": 20}, "raw_written_off_quantity": {"value": "0", "precision": 20}, "return_received_quantity": 0, "raw_compare_at_unit_price": null, "return_dismissed_quantity": 0, "return_requested_quantity": 0, "raw_return_received_quantity": {"value": "0", "precision": 20}, "raw_return_dismissed_quantity": {"value": "0", "precision": 20}, "raw_return_requested_quantity": {"value": "0", "precision": 20}}, "metadata": {}, "quantity": 1, "subtitle": "S", "tax_lines": [], "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png", "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "product_id": "prod_01KKS0NXERTEZQTGVZJHWQQM2A", "unit_price": 10, "updated_at": "2026-04-05T12:56:44.769Z", "variant_id": "variant_01KKS0NXJ468WFHB5JPG46TJHJ", "adjustments": [], "is_giftcard": false, "variant_sku": "SHORTS-S", "product_type": null, "raw_quantity": {"value": "1", "precision": 20}, "product_title": "Medusa Shorts", "variant_title": "S", "product_handle": "shorts", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "requires_shipping": true, "product_collection": null, "product_description": "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "variant_option_values": null, "raw_compare_at_unit_price": null}], "locale": null, "status": "pending", "summary": {"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 30, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 30, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 30, "original_order_total": 30, "raw_accounting_total": {"value": "30", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "30", "precision": 20}, "raw_current_order_total": {"value": "30", "precision": 20}, "raw_original_order_total": {"value": "30", "precision": 20}}, "version": 1, "metadata": null, "region_id": "reg_01KKS0NX3SA64NJ3XV501K8DX9", "created_at": "2026-04-05T12:56:44.768Z", "deleted_at": null, "display_id": 8, "updated_at": "2026-04-05T12:56:44.768Z", "canceled_at": null, "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "credit_lines": [], "transactions": [], "currency_code": "eur", "is_draft_order": false, "billing_address": {"id": "ordaddr_01KNEVF4ETGNRPVPXT6G0SNHMT", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "no_notification": false, "sales_channel_id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "shipping_address": {"id": "ordaddr_01KNEVF4ET8Y3YHDPE4XC77QKF", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "shipping_methods": [{"id": "ordsm_01KNEVF4EXWPDT33XD52CXEADM", "data": {}, "name": "Standard Shipping", "amount": 10, "detail": {"id": "ordspmv_01KNEVF4EXPHDRAAZVY8P8HJTS", "version": 1, "claim_id": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "return_id": null, "created_at": "2026-04-05T12:56:44.770Z", "deleted_at": null, "updated_at": "2026-04-05T12:56:44.770Z", "exchange_id": null, "shipping_method_id": "ordsm_01KNEVF4EXWPDT33XD52CXEADM"}, "metadata": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "tax_lines": [], "created_at": "2026-04-05T12:56:44.770Z", "deleted_at": null, "raw_amount": {"value": "10", "precision": 20}, "updated_at": "2026-04-05T12:56:44.770Z", "adjustments": [], "description": null, "is_custom_amount": false, "is_tax_inclusive": false, "shipping_option_id": "so_01KKS0NXAAGF840G2QZAQZNA4P"}], "custom_display_id": null, "billing_address_id": "ordaddr_01KNEVF4ETGNRPVPXT6G0SNHMT", "shipping_address_id": "ordaddr_01KNEVF4ET8Y3YHDPE4XC77QKF"}, "compensateInput": {"id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "email": "208017534@qq.com", "items": [{"id": "ordli_01KNEVF4EY0GJXSE1GJFWB51BC", "title": "Medusa Sweatshirt", "detail": {"id": "orditem_01KNEVF4EZZ8WJYR5KAVYB8FY7", "item_id": "ordli_01KNEVF4EY0GJXSE1GJFWB51BC", "version": 1, "metadata": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "quantity": 1, "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "unit_price": null, "updated_at": "2026-04-05T12:56:44.769Z", "raw_quantity": {"value": "1", "precision": 20}, "raw_unit_price": null, "shipped_quantity": 0, "delivered_quantity": 0, "fulfilled_quantity": 0, "raw_shipped_quantity": {"value": "0", "precision": 20}, "written_off_quantity": 0, "compare_at_unit_price": null, "raw_delivered_quantity": {"value": "0", "precision": 20}, "raw_fulfilled_quantity": {"value": "0", "precision": 20}, "raw_written_off_quantity": {"value": "0", "precision": 20}, "return_received_quantity": 0, "raw_compare_at_unit_price": null, "return_dismissed_quantity": 0, "return_requested_quantity": 0, "raw_return_received_quantity": {"value": "0", "precision": 20}, "raw_return_dismissed_quantity": {"value": "0", "precision": 20}, "raw_return_requested_quantity": {"value": "0", "precision": 20}}, "metadata": {}, "quantity": 1, "subtitle": "S", "tax_lines": [], "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png", "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "product_id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB", "unit_price": 10, "updated_at": "2026-04-05T12:56:44.769Z", "variant_id": "variant_01KKS0NXJ3G9VBA54CADHC4PFY", "adjustments": [], "is_giftcard": false, "variant_sku": "SWEATSHIRT-S", "product_type": null, "raw_quantity": {"value": "1", "precision": 20}, "product_title": "Medusa Sweatshirt", "variant_title": "S", "product_handle": "sweatshirt", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "requires_shipping": true, "product_collection": null, "product_description": "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "variant_option_values": null, "raw_compare_at_unit_price": null}, {"id": "ordli_01KNEVF4EZSYEND0PW1PYXSBER", "title": "Medusa Shorts", "detail": {"id": "orditem_01KNEVF4EZB61JGBY943BNC7Y7", "item_id": "ordli_01KNEVF4EZSYEND0PW1PYXSBER", "version": 1, "metadata": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "quantity": 1, "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "unit_price": null, "updated_at": "2026-04-05T12:56:44.769Z", "raw_quantity": {"value": "1", "precision": 20}, "raw_unit_price": null, "shipped_quantity": 0, "delivered_quantity": 0, "fulfilled_quantity": 0, "raw_shipped_quantity": {"value": "0", "precision": 20}, "written_off_quantity": 0, "compare_at_unit_price": null, "raw_delivered_quantity": {"value": "0", "precision": 20}, "raw_fulfilled_quantity": {"value": "0", "precision": 20}, "raw_written_off_quantity": {"value": "0", "precision": 20}, "return_received_quantity": 0, "raw_compare_at_unit_price": null, "return_dismissed_quantity": 0, "return_requested_quantity": 0, "raw_return_received_quantity": {"value": "0", "precision": 20}, "raw_return_dismissed_quantity": {"value": "0", "precision": 20}, "raw_return_requested_quantity": {"value": "0", "precision": 20}}, "metadata": {}, "quantity": 1, "subtitle": "S", "tax_lines": [], "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png", "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "product_id": "prod_01KKS0NXERTEZQTGVZJHWQQM2A", "unit_price": 10, "updated_at": "2026-04-05T12:56:44.769Z", "variant_id": "variant_01KKS0NXJ468WFHB5JPG46TJHJ", "adjustments": [], "is_giftcard": false, "variant_sku": "SHORTS-S", "product_type": null, "raw_quantity": {"value": "1", "precision": 20}, "product_title": "Medusa Shorts", "variant_title": "S", "product_handle": "shorts", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "requires_shipping": true, "product_collection": null, "product_description": "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "variant_option_values": null, "raw_compare_at_unit_price": null}], "locale": null, "status": "pending", "summary": {"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 30, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 30, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 30, "original_order_total": 30, "raw_accounting_total": {"value": "30", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "30", "precision": 20}, "raw_current_order_total": {"value": "30", "precision": 20}, "raw_original_order_total": {"value": "30", "precision": 20}}, "version": 1, "metadata": null, "region_id": "reg_01KKS0NX3SA64NJ3XV501K8DX9", "created_at": "2026-04-05T12:56:44.768Z", "deleted_at": null, "display_id": 8, "updated_at": "2026-04-05T12:56:44.768Z", "canceled_at": null, "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "credit_lines": [], "transactions": [], "currency_code": "eur", "is_draft_order": false, "billing_address": {"id": "ordaddr_01KNEVF4ETGNRPVPXT6G0SNHMT", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "no_notification": false, "sales_channel_id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "shipping_address": {"id": "ordaddr_01KNEVF4ET8Y3YHDPE4XC77QKF", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "shipping_methods": [{"id": "ordsm_01KNEVF4EXWPDT33XD52CXEADM", "data": {}, "name": "Standard Shipping", "amount": 10, "detail": {"id": "ordspmv_01KNEVF4EXPHDRAAZVY8P8HJTS", "version": 1, "claim_id": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "return_id": null, "created_at": "2026-04-05T12:56:44.770Z", "deleted_at": null, "updated_at": "2026-04-05T12:56:44.770Z", "exchange_id": null, "shipping_method_id": "ordsm_01KNEVF4EXWPDT33XD52CXEADM"}, "metadata": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "tax_lines": [], "created_at": "2026-04-05T12:56:44.770Z", "deleted_at": null, "raw_amount": {"value": "10", "precision": 20}, "updated_at": "2026-04-05T12:56:44.770Z", "adjustments": [], "description": null, "is_custom_amount": false, "is_tax_inclusive": false, "shipping_option_id": "so_01KKS0NXAAGF840G2QZAQZNA4P"}], "custom_display_id": null, "billing_address_id": "ordaddr_01KNEVF4ETGNRPVPXT6G0SNHMT", "shipping_address_id": "ordaddr_01KNEVF4ET8Y3YHDPE4XC77QKF"}}}, "orderCreated": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)"}}, "update-carts": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": [{"id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "email": "208017534@qq.com", "locale": null, "metadata": null, "region_id": "reg_01KKS0NX3SA64NJ3XV501K8DX9", "created_at": "2026-04-05T12:55:38.038Z", "deleted_at": null, "updated_at": "2026-04-05T12:56:44.890Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "completed_at": "2026-04-05T12:56:44.842Z", "currency_code": "eur", "billing_address": {"id": "caaddr_01KNEVEV0VD278W65ZW3SXWYFT"}, "sales_channel_id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "shipping_address": {"id": "caaddr_01KNEVEV0VNK4M24ZJG51VP80K"}, "billing_address_id": "caaddr_01KNEVEV0VD278W65ZW3SXWYFT", "shipping_address_id": "caaddr_01KNEVEV0VNK4M24ZJG51VP80K"}], "compensateInput": {"cartsBeforeUpdate": [{"id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4", "email": "208017534@qq.com", "metadata": null, "region_id": "reg_01KKS0NX3SA64NJ3XV501K8DX9", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "completed_at": null, "currency_code": "eur", "sales_channel_id": "sc_01KKS0NJHVM2S73KTPZF792K8F"}], "addressesBeforeUpdate": []}}}, "create-orders": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": [{"id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "email": "208017534@qq.com", "items": [{"id": "ordli_01KNEVF4EY0GJXSE1GJFWB51BC", "title": "Medusa Sweatshirt", "detail": {"id": "orditem_01KNEVF4EZZ8WJYR5KAVYB8FY7", "item_id": "ordli_01KNEVF4EY0GJXSE1GJFWB51BC", "version": 1, "metadata": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "quantity": 1, "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "unit_price": null, "updated_at": "2026-04-05T12:56:44.769Z", "raw_quantity": {"value": "1", "precision": 20}, "raw_unit_price": null, "shipped_quantity": 0, "delivered_quantity": 0, "fulfilled_quantity": 0, "raw_shipped_quantity": {"value": "0", "precision": 20}, "written_off_quantity": 0, "compare_at_unit_price": null, "raw_delivered_quantity": {"value": "0", "precision": 20}, "raw_fulfilled_quantity": {"value": "0", "precision": 20}, "raw_written_off_quantity": {"value": "0", "precision": 20}, "return_received_quantity": 0, "raw_compare_at_unit_price": null, "return_dismissed_quantity": 0, "return_requested_quantity": 0, "raw_return_received_quantity": {"value": "0", "precision": 20}, "raw_return_dismissed_quantity": {"value": "0", "precision": 20}, "raw_return_requested_quantity": {"value": "0", "precision": 20}}, "metadata": {}, "quantity": 1, "subtitle": "S", "tax_lines": [], "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png", "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "product_id": "prod_01KKS0NXER8KYP7V0W4MVZXJGB", "unit_price": 10, "updated_at": "2026-04-05T12:56:44.769Z", "variant_id": "variant_01KKS0NXJ3G9VBA54CADHC4PFY", "adjustments": [], "is_giftcard": false, "variant_sku": "SWEATSHIRT-S", "product_type": null, "raw_quantity": {"value": "1", "precision": 20}, "product_title": "Medusa Sweatshirt", "variant_title": "S", "product_handle": "sweatshirt", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "requires_shipping": true, "product_collection": null, "product_description": "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "variant_option_values": null, "raw_compare_at_unit_price": null}, {"id": "ordli_01KNEVF4EZSYEND0PW1PYXSBER", "title": "Medusa Shorts", "detail": {"id": "orditem_01KNEVF4EZB61JGBY943BNC7Y7", "item_id": "ordli_01KNEVF4EZSYEND0PW1PYXSBER", "version": 1, "metadata": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "quantity": 1, "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "unit_price": null, "updated_at": "2026-04-05T12:56:44.769Z", "raw_quantity": {"value": "1", "precision": 20}, "raw_unit_price": null, "shipped_quantity": 0, "delivered_quantity": 0, "fulfilled_quantity": 0, "raw_shipped_quantity": {"value": "0", "precision": 20}, "written_off_quantity": 0, "compare_at_unit_price": null, "raw_delivered_quantity": {"value": "0", "precision": 20}, "raw_fulfilled_quantity": {"value": "0", "precision": 20}, "raw_written_off_quantity": {"value": "0", "precision": 20}, "return_received_quantity": 0, "raw_compare_at_unit_price": null, "return_dismissed_quantity": 0, "return_requested_quantity": 0, "raw_return_received_quantity": {"value": "0", "precision": 20}, "raw_return_dismissed_quantity": {"value": "0", "precision": 20}, "raw_return_requested_quantity": {"value": "0", "precision": 20}}, "metadata": {}, "quantity": 1, "subtitle": "S", "tax_lines": [], "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png", "created_at": "2026-04-05T12:56:44.769Z", "deleted_at": null, "product_id": "prod_01KKS0NXERTEZQTGVZJHWQQM2A", "unit_price": 10, "updated_at": "2026-04-05T12:56:44.769Z", "variant_id": "variant_01KKS0NXJ468WFHB5JPG46TJHJ", "adjustments": [], "is_giftcard": false, "variant_sku": "SHORTS-S", "product_type": null, "raw_quantity": {"value": "1", "precision": 20}, "product_title": "Medusa Shorts", "variant_title": "S", "product_handle": "shorts", "raw_unit_price": {"value": "10", "precision": 20}, "is_custom_price": false, "is_discountable": true, "product_type_id": null, "variant_barcode": null, "is_tax_inclusive": false, "product_subtitle": null, "requires_shipping": true, "product_collection": null, "product_description": "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.", "compare_at_unit_price": null, "variant_option_values": null, "raw_compare_at_unit_price": null}], "locale": null, "status": "pending", "summary": {"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 30, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 30, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 30, "original_order_total": 30, "raw_accounting_total": {"value": "30", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "30", "precision": 20}, "raw_current_order_total": {"value": "30", "precision": 20}, "raw_original_order_total": {"value": "30", "precision": 20}}, "version": 1, "metadata": null, "region_id": "reg_01KKS0NX3SA64NJ3XV501K8DX9", "created_at": "2026-04-05T12:56:44.768Z", "deleted_at": null, "display_id": 8, "updated_at": "2026-04-05T12:56:44.768Z", "canceled_at": null, "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "credit_lines": [], "transactions": [], "currency_code": "eur", "is_draft_order": false, "billing_address": {"id": "ordaddr_01KNEVF4ETGNRPVPXT6G0SNHMT", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "no_notification": false, "sales_channel_id": "sc_01KKS0NJHVM2S73KTPZF792K8F", "shipping_address": {"id": "ordaddr_01KNEVF4ET8Y3YHDPE4XC77QKF", "city": "莆田", "phone": "+8615521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-04-05T12:56:35.099Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-04-05T12:56:35.099Z", "customer_id": null, "postal_code": "351100", "country_code": "dk"}, "shipping_methods": [{"id": "ordsm_01KNEVF4EXWPDT33XD52CXEADM", "data": {}, "name": "Standard Shipping", "amount": 10, "detail": {"id": "ordspmv_01KNEVF4EXPHDRAAZVY8P8HJTS", "version": 1, "claim_id": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "return_id": null, "created_at": "2026-04-05T12:56:44.770Z", "deleted_at": null, "updated_at": "2026-04-05T12:56:44.770Z", "exchange_id": null, "shipping_method_id": "ordsm_01KNEVF4EXWPDT33XD52CXEADM"}, "metadata": null, "order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W", "tax_lines": [], "created_at": "2026-04-05T12:56:44.770Z", "deleted_at": null, "raw_amount": {"value": "10", "precision": 20}, "updated_at": "2026-04-05T12:56:44.770Z", "adjustments": [], "description": null, "is_custom_amount": false, "is_tax_inclusive": false, "shipping_option_id": "so_01KKS0NXAAGF840G2QZAQZNA4P"}], "custom_display_id": null, "billing_address_id": "ordaddr_01KNEVF4ETGNRPVPXT6G0SNHMT", "shipping_address_id": "ordaddr_01KNEVF4ET8Y3YHDPE4XC77QKF"}], "compensateInput": ["order_01KNEVF4EXW0GQDWMBXJJJ6R0W"]}}, "register-usage": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": null, "compensateInput": {"computedActions": [], "registrationContext": {"customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "customer_email": "208017534@qq.com"}}}}, "emit-event-step": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": {"eventName": "order.placed", "eventGroupId": "01KNEVF4BXXC5XJX085A46NGPG"}, "compensateInput": {"eventName": "order.placed", "eventGroupId": "01KNEVF4BXXC5XJX085A46NGPG"}}}, "acquire-lock-step": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "compensateInput": {"keys": ["cart_01KNEVD39HAY1ZCPQ4QNZ48EB4"]}}}, "release-lock-step": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": true, "compensateInput": true}}, "validate-shipping": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)"}}, "create-remote-links": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": [{"cart": {"cart_id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4"}, "order": {"order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W"}}, {"order": {"order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W"}, "payment": {"payment_collection_id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}}], "compensateInput": [{"cart": {"cart_id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4"}, "order": {"order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W"}}, {"order": {"order_id": "order_01KNEVF4EXW0GQDWMBXJJJ6R0W"}, "payment": {"payment_collection_id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}}]}}, "use-query-graph-step": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": {}, "compensateInput": {}}}, "add-order-transaction": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": null, "compensateInput": null}}, "reserve-inventory-step": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": [{"id": "resitem_01KNEVF4J73XJY1K2PGE2D0BVF", "metadata": null, "quantity": 1, "created_at": "2026-04-05T12:56:44.883Z", "created_by": null, "deleted_at": null, "updated_at": "2026-04-05T12:56:44.883Z", "description": null, "external_id": null, "location_id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "line_item_id": "ordli_01KNEVF4EY0GJXSE1GJFWB51BC", "raw_quantity": {"value": "1", "precision": 20}, "allow_backorder": false, "inventory_item_id": "iitem_01KKS0NXK49C9HTJ2XZTS0EKPA"}, {"id": "resitem_01KNEVF4J7MR0NDBC2KWKAJTD3", "metadata": null, "quantity": 1, "created_at": "2026-04-05T12:56:44.884Z", "created_by": null, "deleted_at": null, "updated_at": "2026-04-05T12:56:44.884Z", "description": null, "external_id": null, "location_id": "sloc_01KKS0NX6E2NNN6XBHWS9JGQ9Z", "line_item_id": "ordli_01KNEVF4EZSYEND0PW1PYXSBER", "raw_quantity": {"value": "1", "precision": 20}, "allow_backorder": false, "inventory_item_id": "iitem_01KKS0NXK5HZKVWKVHR1YMM4HK"}], "compensateInput": {"reservations": ["resitem_01KNEVF4J73XJY1K2PGE2D0BVF", "resitem_01KNEVF4J7MR0NDBC2KWKAJTD3"], "inventoryItemIds": ["iitem_01KKS0NXK49C9HTJ2XZTS0EKPA", "iitem_01KKS0NXK5HZKVWKVHR1YMM4HK"]}}}, "shipping-options-query": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": {"data": [{"id": "so_01KKS0NXAAGF840G2QZAQZNA4P", "shipping_profile_id": "sp_01KKS0N76BHWM622Y5CCGWFH2D"}]}, "compensateInput": {"data": [{"id": "so_01KKS0NXAAGF840G2QZAQZNA4P", "shipping_profile_id": "sp_01KKS0N76BHWM622Y5CCGWFH2D"}]}}}, "validate-cart-payments": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": [{"id": "payses_01KNEVF2E5937P90AYH7QB722Q", "data": {}, "amount": 30, "status": "pending", "context": {"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [{"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}, {"id": "cuaddr_01KMR2WPG233CNE36V0TEY2T2M", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-03-27T16:43:57.314Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-03-27T16:43:57.314Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}], "billing_address": {"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}, "metadata": {}, "created_at": "2026-04-05T12:56:42.693Z", "deleted_at": null, "raw_amount": {"value": "30", "precision": 20}, "updated_at": "2026-04-05T12:56:42.693Z", "provider_id": "pp_system_default", "authorized_at": null, "currency_code": "eur", "payment_collection_id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}], "compensateInput": [{"id": "payses_01KNEVF2E5937P90AYH7QB722Q", "data": {}, "amount": 30, "status": "pending", "context": {"customer": {"id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "email": "208017534@qq.com", "phone": "15521509168", "metadata": null, "addresses": [{"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}, {"id": "cuaddr_01KMR2WPG233CNE36V0TEY2T2M", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林", "created_at": "2026-03-27T16:43:57.314Z", "deleted_at": null, "first_name": "志强", "updated_at": "2026-03-27T16:43:57.314Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}], "last_name": "zhiqiang", "first_name": "lin", "company_name": null, "account_holders": [{"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}], "billing_address": {"id": "cuaddr_01KMR216BX3SR220GBXYXPSFJ3", "city": "莆田", "phone": "15521509168", "company": "", "metadata": null, "province": "福建", "address_1": "福建省莆田市秀屿区东峤镇上塘村", "address_2": "", "last_name": "林6", "created_at": "2026-03-27T16:28:56.065Z", "deleted_at": null, "first_name": "志强3", "updated_at": "2026-03-27T16:43:50.736Z", "customer_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "postal_code": "351100", "address_name": null, "country_code": "us", "is_default_billing": false, "is_default_shipping": false}}, "account_holder": {"id": "acchld_01KMAZM7VFVFWEHW7AZMKVXH0V", "data": {}, "email": "208017534@qq.com", "metadata": null, "created_at": "2026-03-22T14:36:46.832Z", "deleted_at": null, "updated_at": "2026-03-22T14:36:46.832Z", "external_id": "cus_01KKVJHTQJ8HRQQ7JF1327DRG5", "provider_id": "pp_system_default"}}, "metadata": {}, "created_at": "2026-04-05T12:56:42.693Z", "deleted_at": null, "raw_amount": {"value": "30", "precision": 20}, "updated_at": "2026-04-05T12:56:42.693Z", "provider_id": "pp_system_default", "authorized_at": null, "currency_code": "eur", "payment_collection_id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}]}}, "beforePaymentAuthorization": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)"}}, "compensate-payment-if-needed": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": "payses_01KNEVF2E5937P90AYH7QB722Q", "compensateInput": "payses_01KNEVF2E5937P90AYH7QB722Q"}}, "authorize-payment-session-step": {"__type": "Symbol(WorkflowWorkflowData)", "output": {"__type": "Symbol(WorkflowStepResponse)", "output": {"id": "pay_01KNEVF4KT1TXTKW0SX2YQYN8K", "data": {}, "amount": 30, "captures": [], "metadata": null, "created_at": "2026-04-05T12:56:44.922Z", "deleted_at": null, "raw_amount": {"value": "30", "precision": 20}, "updated_at": "2026-04-05T12:56:44.922Z", "canceled_at": null, "captured_at": null, "provider_id": "pp_system_default", "currency_code": "eur", "payment_collection": {"id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}, "payment_session_id": "payses_01KNEVF2E5937P90AYH7QB722Q", "payment_collection_id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}, "compensateInput": {"id": "pay_01KNEVF4KT1TXTKW0SX2YQYN8K", "data": {}, "amount": 30, "captures": [], "metadata": null, "created_at": "2026-04-05T12:56:44.922Z", "deleted_at": null, "raw_amount": {"value": "30", "precision": 20}, "updated_at": "2026-04-05T12:56:44.922Z", "canceled_at": null, "captured_at": null, "provider_id": "pp_system_default", "currency_code": "eur", "payment_collection": {"id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}, "payment_session_id": "payses_01KNEVF2E5937P90AYH7QB722Q", "payment_collection_id": "pay_col_01KNEVF2CB25F0V0R409SP04B8"}}}}, "payload": {"id": "cart_01KNEVD39HAY1ZCPQ4QNZ48EB4"}, "compensate": {}}, "errors": []}	done	2026-04-05 12:56:44.677	2026-04-05 12:56:44.981	\N	259200	01KNEVF4BZTKFFDG4Y65ZPW46V
\.


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 254
-- Name: link_module_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.link_module_migrations_id_seq', 152, true);


--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 258
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mikro_orm_migrations_id_seq', 161, true);


--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 266
-- Name: order_change_action_ordering_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_change_action_ordering_seq', 1, false);


--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 268
-- Name: order_claim_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_claim_display_id_seq', 1, false);


--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 272
-- Name: order_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_display_id_seq', 8, true);


--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 274
-- Name: order_exchange_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_exchange_display_id_seq', 1, false);


--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 335
-- Name: return_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_display_id_seq', 1, false);


--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 342
-- Name: script_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.script_migrations_id_seq', 2, true);


--
-- TOC entry 4246 (class 2606 OID 17552)
-- Name: account_holder account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_holder
    ADD CONSTRAINT account_holder_pkey PRIMARY KEY (id);


--
-- TOC entry 4253 (class 2606 OID 17554)
-- Name: api_key api_key_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_key
    ADD CONSTRAINT api_key_pkey PRIMARY KEY (id);


--
-- TOC entry 4255 (class 2606 OID 17556)
-- Name: application_method_buy_rules application_method_buy_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id);


--
-- TOC entry 4257 (class 2606 OID 17558)
-- Name: application_method_target_rules application_method_target_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id);


--
-- TOC entry 4260 (class 2606 OID 17560)
-- Name: auth_identity auth_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_identity
    ADD CONSTRAINT auth_identity_pkey PRIMARY KEY (id);


--
-- TOC entry 4264 (class 2606 OID 17562)
-- Name: capture capture_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capture
    ADD CONSTRAINT capture_pkey PRIMARY KEY (id);


--
-- TOC entry 4276 (class 2606 OID 17564)
-- Name: cart_address cart_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_address
    ADD CONSTRAINT cart_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4287 (class 2606 OID 17566)
-- Name: cart_line_item_adjustment cart_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item_adjustment
    ADD CONSTRAINT cart_line_item_adjustment_pkey PRIMARY KEY (id);


--
-- TOC entry 4282 (class 2606 OID 17568)
-- Name: cart_line_item cart_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item
    ADD CONSTRAINT cart_line_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4292 (class 2606 OID 17570)
-- Name: cart_line_item_tax_line cart_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item_tax_line
    ADD CONSTRAINT cart_line_item_tax_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4298 (class 2606 OID 17572)
-- Name: cart_payment_collection cart_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_payment_collection
    ADD CONSTRAINT cart_payment_collection_pkey PRIMARY KEY (cart_id, payment_collection_id);


--
-- TOC entry 4273 (class 2606 OID 17574)
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- TOC entry 4304 (class 2606 OID 17576)
-- Name: cart_promotion cart_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_promotion
    ADD CONSTRAINT cart_promotion_pkey PRIMARY KEY (cart_id, promotion_id);


--
-- TOC entry 4314 (class 2606 OID 17578)
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method_adjustment
    ADD CONSTRAINT cart_shipping_method_adjustment_pkey PRIMARY KEY (id);


--
-- TOC entry 4309 (class 2606 OID 17580)
-- Name: cart_shipping_method cart_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method
    ADD CONSTRAINT cart_shipping_method_pkey PRIMARY KEY (id);


--
-- TOC entry 4319 (class 2606 OID 17582)
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method_tax_line
    ADD CONSTRAINT cart_shipping_method_tax_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4322 (class 2606 OID 17584)
-- Name: course course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT course_pkey PRIMARY KEY (id);


--
-- TOC entry 4325 (class 2606 OID 17586)
-- Name: course_purchase course_purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_purchase
    ADD CONSTRAINT course_purchase_pkey PRIMARY KEY (id);


--
-- TOC entry 4330 (class 2606 OID 17588)
-- Name: credit_line credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_line
    ADD CONSTRAINT credit_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4332 (class 2606 OID 17590)
-- Name: currency currency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT currency_pkey PRIMARY KEY (code);


--
-- TOC entry 4342 (class 2606 OID 17592)
-- Name: customer_account_holder customer_account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_account_holder
    ADD CONSTRAINT customer_account_holder_pkey PRIMARY KEY (customer_id, account_holder_id);


--
-- TOC entry 4348 (class 2606 OID 17594)
-- Name: customer_address customer_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customer_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4357 (class 2606 OID 17596)
-- Name: customer_group_customer customer_group_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_pkey PRIMARY KEY (id);


--
-- TOC entry 4352 (class 2606 OID 17598)
-- Name: customer_group customer_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_group
    ADD CONSTRAINT customer_group_pkey PRIMARY KEY (id);


--
-- TOC entry 4336 (class 2606 OID 17600)
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- TOC entry 4365 (class 2606 OID 17602)
-- Name: fulfillment_address fulfillment_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_address
    ADD CONSTRAINT fulfillment_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4371 (class 2606 OID 17604)
-- Name: fulfillment_item fulfillment_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4375 (class 2606 OID 17606)
-- Name: fulfillment_label fulfillment_label_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_label
    ADD CONSTRAINT fulfillment_label_pkey PRIMARY KEY (id);


--
-- TOC entry 4362 (class 2606 OID 17608)
-- Name: fulfillment fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_pkey PRIMARY KEY (id);


--
-- TOC entry 4378 (class 2606 OID 17610)
-- Name: fulfillment_provider fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_provider
    ADD CONSTRAINT fulfillment_provider_pkey PRIMARY KEY (id);


--
-- TOC entry 4382 (class 2606 OID 17612)
-- Name: fulfillment_set fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_set
    ADD CONSTRAINT fulfillment_set_pkey PRIMARY KEY (id);


--
-- TOC entry 4389 (class 2606 OID 17614)
-- Name: geo_zone geo_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.geo_zone
    ADD CONSTRAINT geo_zone_pkey PRIMARY KEY (id);


--
-- TOC entry 4393 (class 2606 OID 17616)
-- Name: homepage_content homepage_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.homepage_content
    ADD CONSTRAINT homepage_content_pkey PRIMARY KEY (id);


--
-- TOC entry 4402 (class 2606 OID 17618)
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- TOC entry 4406 (class 2606 OID 17620)
-- Name: inventory_item inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_item
    ADD CONSTRAINT inventory_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4412 (class 2606 OID 17622)
-- Name: inventory_level inventory_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_pkey PRIMARY KEY (id);


--
-- TOC entry 4417 (class 2606 OID 17624)
-- Name: invite invite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT invite_pkey PRIMARY KEY (id);


--
-- TOC entry 4420 (class 2606 OID 17626)
-- Name: lesson lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson
    ADD CONSTRAINT lesson_pkey PRIMARY KEY (id);


--
-- TOC entry 4422 (class 2606 OID 17628)
-- Name: link_module_migrations link_module_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link_module_migrations
    ADD CONSTRAINT link_module_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4424 (class 2606 OID 17630)
-- Name: link_module_migrations link_module_migrations_table_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link_module_migrations
    ADD CONSTRAINT link_module_migrations_table_name_key UNIQUE (table_name);


--
-- TOC entry 4430 (class 2606 OID 17632)
-- Name: location_fulfillment_provider location_fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_fulfillment_provider
    ADD CONSTRAINT location_fulfillment_provider_pkey PRIMARY KEY (stock_location_id, fulfillment_provider_id);


--
-- TOC entry 4436 (class 2606 OID 17634)
-- Name: location_fulfillment_set location_fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_fulfillment_set
    ADD CONSTRAINT location_fulfillment_set_pkey PRIMARY KEY (stock_location_id, fulfillment_set_id);


--
-- TOC entry 4438 (class 2606 OID 17636)
-- Name: mikro_orm_migrations mikro_orm_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mikro_orm_migrations
    ADD CONSTRAINT mikro_orm_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4444 (class 2606 OID 17638)
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- TOC entry 4447 (class 2606 OID 17640)
-- Name: notification_provider notification_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_provider
    ADD CONSTRAINT notification_provider_pkey PRIMARY KEY (id);


--
-- TOC entry 4463 (class 2606 OID 17642)
-- Name: order_address order_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_address
    ADD CONSTRAINT order_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4469 (class 2606 OID 17644)
-- Name: order_cart order_cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_cart
    ADD CONSTRAINT order_cart_pkey PRIMARY KEY (order_id, cart_id);


--
-- TOC entry 4489 (class 2606 OID 17646)
-- Name: order_change_action order_change_action_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change_action
    ADD CONSTRAINT order_change_action_pkey PRIMARY KEY (id);


--
-- TOC entry 4480 (class 2606 OID 17648)
-- Name: order_change order_change_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change
    ADD CONSTRAINT order_change_pkey PRIMARY KEY (id);


--
-- TOC entry 4504 (class 2606 OID 17650)
-- Name: order_claim_item_image order_claim_item_image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_claim_item_image
    ADD CONSTRAINT order_claim_item_image_pkey PRIMARY KEY (id);


--
-- TOC entry 4500 (class 2606 OID 17652)
-- Name: order_claim_item order_claim_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_claim_item
    ADD CONSTRAINT order_claim_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4495 (class 2606 OID 17654)
-- Name: order_claim order_claim_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_claim
    ADD CONSTRAINT order_claim_pkey PRIMARY KEY (id);


--
-- TOC entry 4509 (class 2606 OID 17656)
-- Name: order_credit_line order_credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_credit_line
    ADD CONSTRAINT order_credit_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4520 (class 2606 OID 17658)
-- Name: order_exchange_item order_exchange_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_exchange_item
    ADD CONSTRAINT order_exchange_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4515 (class 2606 OID 17660)
-- Name: order_exchange order_exchange_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_exchange
    ADD CONSTRAINT order_exchange_pkey PRIMARY KEY (id);


--
-- TOC entry 4526 (class 2606 OID 17662)
-- Name: order_fulfillment order_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_fulfillment
    ADD CONSTRAINT order_fulfillment_pkey PRIMARY KEY (order_id, fulfillment_id);


--
-- TOC entry 4532 (class 2606 OID 17664)
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4540 (class 2606 OID 17666)
-- Name: order_line_item_adjustment order_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item_adjustment
    ADD CONSTRAINT order_line_item_adjustment_pkey PRIMARY KEY (id);


--
-- TOC entry 4537 (class 2606 OID 17668)
-- Name: order_line_item order_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item
    ADD CONSTRAINT order_line_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4543 (class 2606 OID 17670)
-- Name: order_line_item_tax_line order_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item_tax_line
    ADD CONSTRAINT order_line_item_tax_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4549 (class 2606 OID 17672)
-- Name: order_payment_collection order_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_payment_collection
    ADD CONSTRAINT order_payment_collection_pkey PRIMARY KEY (order_id, payment_collection_id);


--
-- TOC entry 4459 (class 2606 OID 17674)
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- TOC entry 4555 (class 2606 OID 17676)
-- Name: order_promotion order_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_promotion
    ADD CONSTRAINT order_promotion_pkey PRIMARY KEY (order_id, promotion_id);


--
-- TOC entry 4571 (class 2606 OID 17678)
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method_adjustment
    ADD CONSTRAINT order_shipping_method_adjustment_pkey PRIMARY KEY (id);


--
-- TOC entry 4568 (class 2606 OID 17680)
-- Name: order_shipping_method order_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method
    ADD CONSTRAINT order_shipping_method_pkey PRIMARY KEY (id);


--
-- TOC entry 4574 (class 2606 OID 17682)
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method_tax_line
    ADD CONSTRAINT order_shipping_method_tax_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4565 (class 2606 OID 17684)
-- Name: order_shipping order_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_pkey PRIMARY KEY (id);


--
-- TOC entry 4578 (class 2606 OID 17686)
-- Name: order_summary order_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_summary
    ADD CONSTRAINT order_summary_pkey PRIMARY KEY (id);


--
-- TOC entry 4587 (class 2606 OID 17688)
-- Name: order_transaction order_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_transaction
    ADD CONSTRAINT order_transaction_pkey PRIMARY KEY (id);


--
-- TOC entry 4599 (class 2606 OID 17690)
-- Name: payment_collection_payment_providers payment_collection_payment_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_pkey PRIMARY KEY (payment_collection_id, payment_provider_id);


--
-- TOC entry 4597 (class 2606 OID 17692)
-- Name: payment_collection payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_collection
    ADD CONSTRAINT payment_collection_pkey PRIMARY KEY (id);


--
-- TOC entry 4594 (class 2606 OID 17694)
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- TOC entry 4602 (class 2606 OID 17696)
-- Name: payment_provider payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_provider
    ADD CONSTRAINT payment_provider_pkey PRIMARY KEY (id);


--
-- TOC entry 4606 (class 2606 OID 17698)
-- Name: payment_session payment_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_session
    ADD CONSTRAINT payment_session_pkey PRIMARY KEY (id);


--
-- TOC entry 4616 (class 2606 OID 17700)
-- Name: price_list price_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list
    ADD CONSTRAINT price_list_pkey PRIMARY KEY (id);


--
-- TOC entry 4622 (class 2606 OID 17702)
-- Name: price_list_rule price_list_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list_rule
    ADD CONSTRAINT price_list_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4612 (class 2606 OID 17704)
-- Name: price price_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_pkey PRIMARY KEY (id);


--
-- TOC entry 4626 (class 2606 OID 17706)
-- Name: price_preference price_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_preference
    ADD CONSTRAINT price_preference_pkey PRIMARY KEY (id);


--
-- TOC entry 4636 (class 2606 OID 17708)
-- Name: price_rule price_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rule
    ADD CONSTRAINT price_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4639 (class 2606 OID 17710)
-- Name: price_set price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_set
    ADD CONSTRAINT price_set_pkey PRIMARY KEY (id);


--
-- TOC entry 4651 (class 2606 OID 17712)
-- Name: product_category product_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_pkey PRIMARY KEY (id);


--
-- TOC entry 4653 (class 2606 OID 17714)
-- Name: product_category_product product_category_product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_pkey PRIMARY KEY (product_id, product_category_id);


--
-- TOC entry 4657 (class 2606 OID 17716)
-- Name: product_collection product_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_collection
    ADD CONSTRAINT product_collection_pkey PRIMARY KEY (id);


--
-- TOC entry 4661 (class 2606 OID 17718)
-- Name: product_detail product_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_detail
    ADD CONSTRAINT product_detail_pkey PRIMARY KEY (id);


--
-- TOC entry 4665 (class 2606 OID 17720)
-- Name: product_image_meta product_image_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_image_meta
    ADD CONSTRAINT product_image_meta_pkey PRIMARY KEY (id);


--
-- TOC entry 4670 (class 2606 OID 17722)
-- Name: product_option product_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option
    ADD CONSTRAINT product_option_pkey PRIMARY KEY (id);


--
-- TOC entry 4675 (class 2606 OID 17724)
-- Name: product_option_value product_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_value
    ADD CONSTRAINT product_option_value_pkey PRIMARY KEY (id);


--
-- TOC entry 4646 (class 2606 OID 17726)
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- TOC entry 4681 (class 2606 OID 17728)
-- Name: product_sales_channel product_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sales_channel
    ADD CONSTRAINT product_sales_channel_pkey PRIMARY KEY (product_id, sales_channel_id);


--
-- TOC entry 4687 (class 2606 OID 17730)
-- Name: product_shipping_profile product_shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_shipping_profile
    ADD CONSTRAINT product_shipping_profile_pkey PRIMARY KEY (product_id, shipping_profile_id);


--
-- TOC entry 4691 (class 2606 OID 17732)
-- Name: product_tag product_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tag
    ADD CONSTRAINT product_tag_pkey PRIMARY KEY (id);


--
-- TOC entry 4693 (class 2606 OID 17734)
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, product_tag_id);


--
-- TOC entry 4697 (class 2606 OID 17736)
-- Name: product_type product_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_type
    ADD CONSTRAINT product_type_pkey PRIMARY KEY (id);


--
-- TOC entry 4712 (class 2606 OID 17738)
-- Name: product_variant_inventory_item product_variant_inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_inventory_item
    ADD CONSTRAINT product_variant_inventory_item_pkey PRIMARY KEY (variant_id, inventory_item_id);


--
-- TOC entry 4714 (class 2606 OID 17740)
-- Name: product_variant_option product_variant_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_pkey PRIMARY KEY (variant_id, option_value_id);


--
-- TOC entry 4706 (class 2606 OID 17742)
-- Name: product_variant product_variant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT product_variant_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 17744)
-- Name: product_variant_price_set product_variant_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_price_set
    ADD CONSTRAINT product_variant_price_set_pkey PRIMARY KEY (variant_id, price_set_id);


--
-- TOC entry 4725 (class 2606 OID 17746)
-- Name: product_variant_product_image product_variant_product_image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_product_image
    ADD CONSTRAINT product_variant_product_image_pkey PRIMARY KEY (id);


--
-- TOC entry 4741 (class 2606 OID 17748)
-- Name: promotion_application_method promotion_application_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_application_method
    ADD CONSTRAINT promotion_application_method_pkey PRIMARY KEY (id);


--
-- TOC entry 4750 (class 2606 OID 17750)
-- Name: promotion_campaign_budget promotion_campaign_budget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign_budget
    ADD CONSTRAINT promotion_campaign_budget_pkey PRIMARY KEY (id);


--
-- TOC entry 4755 (class 2606 OID 17752)
-- Name: promotion_campaign_budget_usage promotion_campaign_budget_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign_budget_usage
    ADD CONSTRAINT promotion_campaign_budget_usage_pkey PRIMARY KEY (id);


--
-- TOC entry 4745 (class 2606 OID 17754)
-- Name: promotion_campaign promotion_campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign
    ADD CONSTRAINT promotion_campaign_pkey PRIMARY KEY (id);


--
-- TOC entry 4733 (class 2606 OID 17756)
-- Name: promotion promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion
    ADD CONSTRAINT promotion_pkey PRIMARY KEY (id);


--
-- TOC entry 4757 (class 2606 OID 17758)
-- Name: promotion_promotion_rule promotion_promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_pkey PRIMARY KEY (promotion_id, promotion_rule_id);


--
-- TOC entry 4764 (class 2606 OID 17760)
-- Name: promotion_rule promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rule
    ADD CONSTRAINT promotion_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4770 (class 2606 OID 17762)
-- Name: promotion_rule_value promotion_rule_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rule_value
    ADD CONSTRAINT promotion_rule_value_pkey PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 17764)
-- Name: provider_identity provider_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_identity
    ADD CONSTRAINT provider_identity_pkey PRIMARY KEY (id);


--
-- TOC entry 4781 (class 2606 OID 17766)
-- Name: publishable_api_key_sales_channel publishable_api_key_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publishable_api_key_sales_channel
    ADD CONSTRAINT publishable_api_key_sales_channel_pkey PRIMARY KEY (publishable_key_id, sales_channel_id);


--
-- TOC entry 4786 (class 2606 OID 17768)
-- Name: refund refund_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_pkey PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 17770)
-- Name: refund_reason refund_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_reason
    ADD CONSTRAINT refund_reason_pkey PRIMARY KEY (id);


--
-- TOC entry 4797 (class 2606 OID 17772)
-- Name: region_country region_country_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.region_country
    ADD CONSTRAINT region_country_pkey PRIMARY KEY (iso_2);


--
-- TOC entry 4803 (class 2606 OID 17774)
-- Name: region_payment_provider region_payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.region_payment_provider
    ADD CONSTRAINT region_payment_provider_pkey PRIMARY KEY (region_id, payment_provider_id);


--
-- TOC entry 4792 (class 2606 OID 17776)
-- Name: region region_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.region
    ADD CONSTRAINT region_pkey PRIMARY KEY (id);


--
-- TOC entry 4809 (class 2606 OID 17778)
-- Name: reservation_item reservation_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 17780)
-- Name: return_fulfillment return_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_fulfillment
    ADD CONSTRAINT return_fulfillment_pkey PRIMARY KEY (return_id, fulfillment_id);


--
-- TOC entry 4827 (class 2606 OID 17782)
-- Name: return_item return_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_item
    ADD CONSTRAINT return_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 17784)
-- Name: return return_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return
    ADD CONSTRAINT return_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 17786)
-- Name: return_reason return_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reason
    ADD CONSTRAINT return_reason_pkey PRIMARY KEY (id);


--
-- TOC entry 4834 (class 2606 OID 17788)
-- Name: sales_channel sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_channel
    ADD CONSTRAINT sales_channel_pkey PRIMARY KEY (id);


--
-- TOC entry 4840 (class 2606 OID 17790)
-- Name: sales_channel_stock_location sales_channel_stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_channel_stock_location
    ADD CONSTRAINT sales_channel_stock_location_pkey PRIMARY KEY (sales_channel_id, stock_location_id);


--
-- TOC entry 4843 (class 2606 OID 17792)
-- Name: script_migrations script_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.script_migrations
    ADD CONSTRAINT script_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 17794)
-- Name: service_zone service_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_zone
    ADD CONSTRAINT service_zone_pkey PRIMARY KEY (id);


--
-- TOC entry 4855 (class 2606 OID 17796)
-- Name: shipping_option shipping_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_pkey PRIMARY KEY (id);


--
-- TOC entry 4861 (class 2606 OID 17798)
-- Name: shipping_option_price_set shipping_option_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option_price_set
    ADD CONSTRAINT shipping_option_price_set_pkey PRIMARY KEY (shipping_option_id, price_set_id);


--
-- TOC entry 4865 (class 2606 OID 17800)
-- Name: shipping_option_rule shipping_option_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option_rule
    ADD CONSTRAINT shipping_option_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4868 (class 2606 OID 17802)
-- Name: shipping_option_type shipping_option_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option_type
    ADD CONSTRAINT shipping_option_type_pkey PRIMARY KEY (id);


--
-- TOC entry 4872 (class 2606 OID 17804)
-- Name: shipping_profile shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_profile
    ADD CONSTRAINT shipping_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4879 (class 2606 OID 17806)
-- Name: stock_location_address stock_location_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_location_address
    ADD CONSTRAINT stock_location_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 17808)
-- Name: stock_location stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_location
    ADD CONSTRAINT stock_location_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 17810)
-- Name: store_currency store_currency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_currency
    ADD CONSTRAINT store_currency_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 17812)
-- Name: store_locale store_locale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_locale
    ADD CONSTRAINT store_locale_pkey PRIMARY KEY (id);


--
-- TOC entry 4882 (class 2606 OID 17814)
-- Name: store store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 2606 OID 17816)
-- Name: tax_provider tax_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_provider
    ADD CONSTRAINT tax_provider_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 17818)
-- Name: tax_rate tax_rate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_rate
    ADD CONSTRAINT tax_rate_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 2606 OID 17820)
-- Name: tax_rate_rule tax_rate_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_rate_rule
    ADD CONSTRAINT tax_rate_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 2606 OID 17822)
-- Name: tax_region tax_region_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT tax_region_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 17824)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4920 (class 2606 OID 17826)
-- Name: user_preference user_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preference
    ADD CONSTRAINT user_preference_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 17828)
-- Name: user_rbac_role user_rbac_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_rbac_role
    ADD CONSTRAINT user_rbac_role_pkey PRIMARY KEY (user_id, rbac_role_id);


--
-- TOC entry 4932 (class 2606 OID 17830)
-- Name: view_configuration view_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.view_configuration
    ADD CONSTRAINT view_configuration_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 17832)
-- Name: workflow_execution workflow_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_execution
    ADD CONSTRAINT workflow_execution_pkey PRIMARY KEY (workflow_id, transaction_id, run_id);


--
-- TOC entry 4243 (class 1259 OID 17833)
-- Name: IDX_account_holder_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_account_holder_deleted_at" ON public.account_holder USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4337 (class 1259 OID 17834)
-- Name: IDX_account_holder_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_account_holder_id_5cb3a0c0" ON public.customer_account_holder USING btree (account_holder_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4244 (class 1259 OID 17835)
-- Name: IDX_account_holder_provider_id_external_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_account_holder_provider_id_external_id_unique" ON public.account_holder USING btree (provider_id, external_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4247 (class 1259 OID 17836)
-- Name: IDX_api_key_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_api_key_deleted_at" ON public.api_key USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4248 (class 1259 OID 17837)
-- Name: IDX_api_key_redacted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_api_key_redacted" ON public.api_key USING btree (redacted) WHERE (deleted_at IS NULL);


--
-- TOC entry 4249 (class 1259 OID 17838)
-- Name: IDX_api_key_revoked_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_api_key_revoked_at" ON public.api_key USING btree (revoked_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4250 (class 1259 OID 17839)
-- Name: IDX_api_key_token_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_api_key_token_unique" ON public.api_key USING btree (token);


--
-- TOC entry 4251 (class 1259 OID 17840)
-- Name: IDX_api_key_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_api_key_type" ON public.api_key USING btree (type);


--
-- TOC entry 4734 (class 1259 OID 17841)
-- Name: IDX_application_method_allocation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_application_method_allocation" ON public.promotion_application_method USING btree (allocation);


--
-- TOC entry 4735 (class 1259 OID 17842)
-- Name: IDX_application_method_target_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_application_method_target_type" ON public.promotion_application_method USING btree (target_type);


--
-- TOC entry 4736 (class 1259 OID 17843)
-- Name: IDX_application_method_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_application_method_type" ON public.promotion_application_method USING btree (type);


--
-- TOC entry 4258 (class 1259 OID 17844)
-- Name: IDX_auth_identity_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_identity_deleted_at" ON public.auth_identity USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4746 (class 1259 OID 17845)
-- Name: IDX_campaign_budget_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_campaign_budget_type" ON public.promotion_campaign_budget USING btree (type);


--
-- TOC entry 4261 (class 1259 OID 17846)
-- Name: IDX_capture_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_capture_deleted_at" ON public.capture USING btree (deleted_at);


--
-- TOC entry 4262 (class 1259 OID 17847)
-- Name: IDX_capture_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_capture_payment_id" ON public.capture USING btree (payment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4274 (class 1259 OID 17848)
-- Name: IDX_cart_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_address_deleted_at" ON public.cart_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4265 (class 1259 OID 17849)
-- Name: IDX_cart_billing_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_billing_address_id" ON public.cart USING btree (billing_address_id) WHERE ((deleted_at IS NULL) AND (billing_address_id IS NOT NULL));


--
-- TOC entry 4326 (class 1259 OID 17850)
-- Name: IDX_cart_credit_line_reference_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_credit_line_reference_reference_id" ON public.credit_line USING btree (reference, reference_id) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4266 (class 1259 OID 17851)
-- Name: IDX_cart_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_currency_code" ON public.cart USING btree (currency_code);


--
-- TOC entry 4267 (class 1259 OID 17852)
-- Name: IDX_cart_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_customer_id" ON public.cart USING btree (customer_id) WHERE ((deleted_at IS NULL) AND (customer_id IS NOT NULL));


--
-- TOC entry 4268 (class 1259 OID 17853)
-- Name: IDX_cart_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_deleted_at" ON public.cart USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4293 (class 1259 OID 17854)
-- Name: IDX_cart_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_id_-4a39f6c9" ON public.cart_payment_collection USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4464 (class 1259 OID 17855)
-- Name: IDX_cart_id_-71069c16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_id_-71069c16" ON public.order_cart USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4299 (class 1259 OID 17856)
-- Name: IDX_cart_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_id_-a9d4a70b" ON public.cart_promotion USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4283 (class 1259 OID 17857)
-- Name: IDX_cart_line_item_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_adjustment_deleted_at" ON public.cart_line_item_adjustment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4284 (class 1259 OID 17858)
-- Name: IDX_cart_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_adjustment_item_id" ON public.cart_line_item_adjustment USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4277 (class 1259 OID 17859)
-- Name: IDX_cart_line_item_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_cart_id" ON public.cart_line_item USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4278 (class 1259 OID 17860)
-- Name: IDX_cart_line_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_deleted_at" ON public.cart_line_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4288 (class 1259 OID 17861)
-- Name: IDX_cart_line_item_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_tax_line_deleted_at" ON public.cart_line_item_tax_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4289 (class 1259 OID 17862)
-- Name: IDX_cart_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_tax_line_item_id" ON public.cart_line_item_tax_line USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4269 (class 1259 OID 17863)
-- Name: IDX_cart_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_region_id" ON public.cart USING btree (region_id) WHERE ((deleted_at IS NULL) AND (region_id IS NOT NULL));


--
-- TOC entry 4270 (class 1259 OID 17864)
-- Name: IDX_cart_sales_channel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_sales_channel_id" ON public.cart USING btree (sales_channel_id) WHERE ((deleted_at IS NULL) AND (sales_channel_id IS NOT NULL));


--
-- TOC entry 4271 (class 1259 OID 17865)
-- Name: IDX_cart_shipping_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_address_id" ON public.cart USING btree (shipping_address_id) WHERE ((deleted_at IS NULL) AND (shipping_address_id IS NOT NULL));


--
-- TOC entry 4310 (class 1259 OID 17866)
-- Name: IDX_cart_shipping_method_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_deleted_at" ON public.cart_shipping_method_adjustment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4311 (class 1259 OID 17867)
-- Name: IDX_cart_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_shipping_method_id" ON public.cart_shipping_method_adjustment USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4305 (class 1259 OID 17868)
-- Name: IDX_cart_shipping_method_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_cart_id" ON public.cart_shipping_method USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4306 (class 1259 OID 17869)
-- Name: IDX_cart_shipping_method_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_deleted_at" ON public.cart_shipping_method USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4315 (class 1259 OID 17870)
-- Name: IDX_cart_shipping_method_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_deleted_at" ON public.cart_shipping_method_tax_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4316 (class 1259 OID 17871)
-- Name: IDX_cart_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_shipping_method_id" ON public.cart_shipping_method_tax_line USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4647 (class 1259 OID 17872)
-- Name: IDX_category_handle_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_category_handle_unique" ON public.product_category USING btree (handle) WHERE (deleted_at IS NULL);


--
-- TOC entry 4654 (class 1259 OID 17873)
-- Name: IDX_collection_handle_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_collection_handle_unique" ON public.product_collection USING btree (handle) WHERE (deleted_at IS NULL);


--
-- TOC entry 4320 (class 1259 OID 17874)
-- Name: IDX_course_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_course_deleted_at" ON public.course USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4323 (class 1259 OID 17875)
-- Name: IDX_course_purchase_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_course_purchase_deleted_at" ON public.course_purchase USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4327 (class 1259 OID 17876)
-- Name: IDX_credit_line_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_credit_line_cart_id" ON public.credit_line USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4328 (class 1259 OID 17877)
-- Name: IDX_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_credit_line_deleted_at" ON public.credit_line USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4343 (class 1259 OID 17878)
-- Name: IDX_customer_address_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_address_customer_id" ON public.customer_address USING btree (customer_id);


--
-- TOC entry 4344 (class 1259 OID 17879)
-- Name: IDX_customer_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_address_deleted_at" ON public.customer_address USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4345 (class 1259 OID 17880)
-- Name: IDX_customer_address_unique_customer_billing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_billing" ON public.customer_address USING btree (customer_id) WHERE (is_default_billing = true);


--
-- TOC entry 4346 (class 1259 OID 17881)
-- Name: IDX_customer_address_unique_customer_shipping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_shipping" ON public.customer_address USING btree (customer_id) WHERE (is_default_shipping = true);


--
-- TOC entry 4333 (class 1259 OID 17882)
-- Name: IDX_customer_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_deleted_at" ON public.customer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4334 (class 1259 OID 17883)
-- Name: IDX_customer_email_has_account_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_customer_email_has_account_unique" ON public.customer USING btree (email, has_account) WHERE (deleted_at IS NULL);


--
-- TOC entry 4353 (class 1259 OID 17884)
-- Name: IDX_customer_group_customer_customer_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_group_customer_customer_group_id" ON public.customer_group_customer USING btree (customer_group_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4354 (class 1259 OID 17885)
-- Name: IDX_customer_group_customer_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_group_customer_customer_id" ON public.customer_group_customer USING btree (customer_id);


--
-- TOC entry 4355 (class 1259 OID 17886)
-- Name: IDX_customer_group_customer_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_group_customer_deleted_at" ON public.customer_group_customer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4349 (class 1259 OID 17887)
-- Name: IDX_customer_group_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_group_deleted_at" ON public.customer_group USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4350 (class 1259 OID 17888)
-- Name: IDX_customer_group_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_customer_group_name_unique" ON public.customer_group USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4338 (class 1259 OID 17889)
-- Name: IDX_customer_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_id_5cb3a0c0" ON public.customer_account_holder USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4776 (class 1259 OID 17890)
-- Name: IDX_deleted_at_-1d67bae40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (deleted_at);


--
-- TOC entry 4425 (class 1259 OID 17891)
-- Name: IDX_deleted_at_-1e5992737; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-1e5992737" ON public.location_fulfillment_provider USING btree (deleted_at);


--
-- TOC entry 4816 (class 1259 OID 17892)
-- Name: IDX_deleted_at_-31ea43a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-31ea43a" ON public.return_fulfillment USING btree (deleted_at);


--
-- TOC entry 4294 (class 1259 OID 17893)
-- Name: IDX_deleted_at_-4a39f6c9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-4a39f6c9" ON public.cart_payment_collection USING btree (deleted_at);


--
-- TOC entry 4465 (class 1259 OID 17894)
-- Name: IDX_deleted_at_-71069c16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-71069c16" ON public.order_cart USING btree (deleted_at);


--
-- TOC entry 4550 (class 1259 OID 17895)
-- Name: IDX_deleted_at_-71518339; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-71518339" ON public.order_promotion USING btree (deleted_at);


--
-- TOC entry 4300 (class 1259 OID 17896)
-- Name: IDX_deleted_at_-a9d4a70b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-a9d4a70b" ON public.cart_promotion USING btree (deleted_at);


--
-- TOC entry 4431 (class 1259 OID 17897)
-- Name: IDX_deleted_at_-e88adb96; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-e88adb96" ON public.location_fulfillment_set USING btree (deleted_at);


--
-- TOC entry 4521 (class 1259 OID 17898)
-- Name: IDX_deleted_at_-e8d2543e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-e8d2543e" ON public.order_fulfillment USING btree (deleted_at);


--
-- TOC entry 4682 (class 1259 OID 17899)
-- Name: IDX_deleted_at_17a262437; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_17a262437" ON public.product_shipping_profile USING btree (deleted_at);


--
-- TOC entry 4707 (class 1259 OID 17900)
-- Name: IDX_deleted_at_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_17b4c4e35" ON public.product_variant_inventory_item USING btree (deleted_at);


--
-- TOC entry 4798 (class 1259 OID 17901)
-- Name: IDX_deleted_at_1c934dab0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_1c934dab0" ON public.region_payment_provider USING btree (deleted_at);


--
-- TOC entry 4676 (class 1259 OID 17902)
-- Name: IDX_deleted_at_20b454295; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_20b454295" ON public.product_sales_channel USING btree (deleted_at);


--
-- TOC entry 4835 (class 1259 OID 17903)
-- Name: IDX_deleted_at_26d06f470; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_26d06f470" ON public.sales_channel_stock_location USING btree (deleted_at);


--
-- TOC entry 4715 (class 1259 OID 17904)
-- Name: IDX_deleted_at_52b23597; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_52b23597" ON public.product_variant_price_set USING btree (deleted_at);


--
-- TOC entry 4339 (class 1259 OID 17905)
-- Name: IDX_deleted_at_5cb3a0c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_5cb3a0c0" ON public.customer_account_holder USING btree (deleted_at);


--
-- TOC entry 4921 (class 1259 OID 17906)
-- Name: IDX_deleted_at_64ff0c4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_64ff0c4c" ON public.user_rbac_role USING btree (deleted_at);


--
-- TOC entry 4856 (class 1259 OID 17907)
-- Name: IDX_deleted_at_ba32fa9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_ba32fa9c" ON public.shipping_option_price_set USING btree (deleted_at);


--
-- TOC entry 4544 (class 1259 OID 17908)
-- Name: IDX_deleted_at_f42b9949; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_f42b9949" ON public.order_payment_collection USING btree (deleted_at);


--
-- TOC entry 4363 (class 1259 OID 17909)
-- Name: IDX_fulfillment_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_address_deleted_at" ON public.fulfillment_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4358 (class 1259 OID 17910)
-- Name: IDX_fulfillment_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_deleted_at" ON public.fulfillment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4817 (class 1259 OID 17911)
-- Name: IDX_fulfillment_id_-31ea43a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_id_-31ea43a" ON public.return_fulfillment USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4522 (class 1259 OID 17912)
-- Name: IDX_fulfillment_id_-e8d2543e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_id_-e8d2543e" ON public.order_fulfillment USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4366 (class 1259 OID 17913)
-- Name: IDX_fulfillment_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_deleted_at" ON public.fulfillment_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4367 (class 1259 OID 17914)
-- Name: IDX_fulfillment_item_fulfillment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_fulfillment_id" ON public.fulfillment_item USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4368 (class 1259 OID 17915)
-- Name: IDX_fulfillment_item_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_inventory_item_id" ON public.fulfillment_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4369 (class 1259 OID 17916)
-- Name: IDX_fulfillment_item_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_line_item_id" ON public.fulfillment_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4372 (class 1259 OID 17917)
-- Name: IDX_fulfillment_label_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_label_deleted_at" ON public.fulfillment_label USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4373 (class 1259 OID 17918)
-- Name: IDX_fulfillment_label_fulfillment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_label_fulfillment_id" ON public.fulfillment_label USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4359 (class 1259 OID 17919)
-- Name: IDX_fulfillment_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_location_id" ON public.fulfillment USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4376 (class 1259 OID 17920)
-- Name: IDX_fulfillment_provider_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_provider_deleted_at" ON public.fulfillment_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4426 (class 1259 OID 17921)
-- Name: IDX_fulfillment_provider_id_-1e5992737; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_provider_id_-1e5992737" ON public.location_fulfillment_provider USING btree (fulfillment_provider_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4379 (class 1259 OID 17922)
-- Name: IDX_fulfillment_set_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_set_deleted_at" ON public.fulfillment_set USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4432 (class 1259 OID 17923)
-- Name: IDX_fulfillment_set_id_-e88adb96; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_set_id_-e88adb96" ON public.location_fulfillment_set USING btree (fulfillment_set_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4380 (class 1259 OID 17924)
-- Name: IDX_fulfillment_set_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_fulfillment_set_name_unique" ON public.fulfillment_set USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4360 (class 1259 OID 17925)
-- Name: IDX_fulfillment_shipping_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_shipping_option_id" ON public.fulfillment USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4383 (class 1259 OID 17926)
-- Name: IDX_geo_zone_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_city" ON public.geo_zone USING btree (city) WHERE ((deleted_at IS NULL) AND (city IS NOT NULL));


--
-- TOC entry 4384 (class 1259 OID 17927)
-- Name: IDX_geo_zone_country_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_country_code" ON public.geo_zone USING btree (country_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4385 (class 1259 OID 17928)
-- Name: IDX_geo_zone_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_deleted_at" ON public.geo_zone USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4386 (class 1259 OID 17929)
-- Name: IDX_geo_zone_province_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_province_code" ON public.geo_zone USING btree (province_code) WHERE ((deleted_at IS NULL) AND (province_code IS NOT NULL));


--
-- TOC entry 4387 (class 1259 OID 17930)
-- Name: IDX_geo_zone_service_zone_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_service_zone_id" ON public.geo_zone USING btree (service_zone_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4390 (class 1259 OID 17931)
-- Name: IDX_homepage_content_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_homepage_content_deleted_at" ON public.homepage_content USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4777 (class 1259 OID 17932)
-- Name: IDX_id_-1d67bae40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (id);


--
-- TOC entry 4427 (class 1259 OID 17933)
-- Name: IDX_id_-1e5992737; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-1e5992737" ON public.location_fulfillment_provider USING btree (id);


--
-- TOC entry 4818 (class 1259 OID 17934)
-- Name: IDX_id_-31ea43a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-31ea43a" ON public.return_fulfillment USING btree (id);


--
-- TOC entry 4295 (class 1259 OID 17935)
-- Name: IDX_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-4a39f6c9" ON public.cart_payment_collection USING btree (id);


--
-- TOC entry 4466 (class 1259 OID 17936)
-- Name: IDX_id_-71069c16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-71069c16" ON public.order_cart USING btree (id);


--
-- TOC entry 4551 (class 1259 OID 17937)
-- Name: IDX_id_-71518339; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-71518339" ON public.order_promotion USING btree (id);


--
-- TOC entry 4301 (class 1259 OID 17938)
-- Name: IDX_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-a9d4a70b" ON public.cart_promotion USING btree (id);


--
-- TOC entry 4433 (class 1259 OID 17939)
-- Name: IDX_id_-e88adb96; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-e88adb96" ON public.location_fulfillment_set USING btree (id);


--
-- TOC entry 4523 (class 1259 OID 17940)
-- Name: IDX_id_-e8d2543e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-e8d2543e" ON public.order_fulfillment USING btree (id);


--
-- TOC entry 4683 (class 1259 OID 17941)
-- Name: IDX_id_17a262437; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_17a262437" ON public.product_shipping_profile USING btree (id);


--
-- TOC entry 4708 (class 1259 OID 17942)
-- Name: IDX_id_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (id);


--
-- TOC entry 4799 (class 1259 OID 17943)
-- Name: IDX_id_1c934dab0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_1c934dab0" ON public.region_payment_provider USING btree (id);


--
-- TOC entry 4677 (class 1259 OID 17944)
-- Name: IDX_id_20b454295; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_20b454295" ON public.product_sales_channel USING btree (id);


--
-- TOC entry 4836 (class 1259 OID 17945)
-- Name: IDX_id_26d06f470; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_26d06f470" ON public.sales_channel_stock_location USING btree (id);


--
-- TOC entry 4716 (class 1259 OID 17946)
-- Name: IDX_id_52b23597; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_52b23597" ON public.product_variant_price_set USING btree (id);


--
-- TOC entry 4340 (class 1259 OID 17947)
-- Name: IDX_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_5cb3a0c0" ON public.customer_account_holder USING btree (id);


--
-- TOC entry 4922 (class 1259 OID 17948)
-- Name: IDX_id_64ff0c4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_64ff0c4c" ON public.user_rbac_role USING btree (id);


--
-- TOC entry 4857 (class 1259 OID 17949)
-- Name: IDX_id_ba32fa9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_ba32fa9c" ON public.shipping_option_price_set USING btree (id);


--
-- TOC entry 4545 (class 1259 OID 17950)
-- Name: IDX_id_f42b9949; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_f42b9949" ON public.order_payment_collection USING btree (id);


--
-- TOC entry 4395 (class 1259 OID 17951)
-- Name: IDX_image_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_image_deleted_at" ON public.image USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4396 (class 1259 OID 17952)
-- Name: IDX_image_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_image_product_id" ON public.image USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4403 (class 1259 OID 17953)
-- Name: IDX_inventory_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_item_deleted_at" ON public.inventory_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4709 (class 1259 OID 17954)
-- Name: IDX_inventory_item_id_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_item_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4404 (class 1259 OID 17955)
-- Name: IDX_inventory_item_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_inventory_item_sku" ON public.inventory_item USING btree (sku) WHERE (deleted_at IS NULL);


--
-- TOC entry 4407 (class 1259 OID 17956)
-- Name: IDX_inventory_level_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_level_deleted_at" ON public.inventory_level USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4408 (class 1259 OID 17957)
-- Name: IDX_inventory_level_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_level_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4409 (class 1259 OID 17958)
-- Name: IDX_inventory_level_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_level_location_id" ON public.inventory_level USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4410 (class 1259 OID 17959)
-- Name: IDX_inventory_level_location_id_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_inventory_level_location_id_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id, location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4413 (class 1259 OID 17960)
-- Name: IDX_invite_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_invite_deleted_at" ON public.invite USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4414 (class 1259 OID 17961)
-- Name: IDX_invite_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_invite_email_unique" ON public.invite USING btree (email) WHERE (deleted_at IS NULL);


--
-- TOC entry 4415 (class 1259 OID 17962)
-- Name: IDX_invite_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_invite_token" ON public.invite USING btree (token) WHERE (deleted_at IS NULL);


--
-- TOC entry 4418 (class 1259 OID 17963)
-- Name: IDX_lesson_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_lesson_deleted_at" ON public.lesson USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4285 (class 1259 OID 17964)
-- Name: IDX_line_item_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_adjustment_promotion_id" ON public.cart_line_item_adjustment USING btree (promotion_id) WHERE ((deleted_at IS NULL) AND (promotion_id IS NOT NULL));


--
-- TOC entry 4279 (class 1259 OID 17965)
-- Name: IDX_line_item_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_product_id" ON public.cart_line_item USING btree (product_id) WHERE ((deleted_at IS NULL) AND (product_id IS NOT NULL));


--
-- TOC entry 4533 (class 1259 OID 17966)
-- Name: IDX_line_item_product_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_product_type_id" ON public.order_line_item USING btree (product_type_id) WHERE ((deleted_at IS NULL) AND (product_type_id IS NOT NULL));


--
-- TOC entry 4290 (class 1259 OID 17967)
-- Name: IDX_line_item_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_tax_line_tax_rate_id" ON public.cart_line_item_tax_line USING btree (tax_rate_id) WHERE ((deleted_at IS NULL) AND (tax_rate_id IS NOT NULL));


--
-- TOC entry 4280 (class 1259 OID 17968)
-- Name: IDX_line_item_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_variant_id" ON public.cart_line_item USING btree (variant_id) WHERE ((deleted_at IS NULL) AND (variant_id IS NOT NULL));


--
-- TOC entry 4439 (class 1259 OID 17969)
-- Name: IDX_notification_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_notification_deleted_at" ON public.notification USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4440 (class 1259 OID 17970)
-- Name: IDX_notification_idempotency_key_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_notification_idempotency_key_unique" ON public.notification USING btree (idempotency_key) WHERE (deleted_at IS NULL);


--
-- TOC entry 4445 (class 1259 OID 17971)
-- Name: IDX_notification_provider_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_notification_provider_deleted_at" ON public.notification_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4441 (class 1259 OID 17972)
-- Name: IDX_notification_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_notification_provider_id" ON public.notification USING btree (provider_id);


--
-- TOC entry 4442 (class 1259 OID 17973)
-- Name: IDX_notification_receiver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_notification_receiver_id" ON public.notification USING btree (receiver_id);


--
-- TOC entry 4666 (class 1259 OID 17974)
-- Name: IDX_option_product_id_title_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_option_product_id_title_unique" ON public.product_option USING btree (product_id, title) WHERE (deleted_at IS NULL);


--
-- TOC entry 4671 (class 1259 OID 17975)
-- Name: IDX_option_value_option_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_option_value_option_id_unique" ON public.product_option_value USING btree (option_id, value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4460 (class 1259 OID 17976)
-- Name: IDX_order_address_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_address_customer_id" ON public.order_address USING btree (customer_id);


--
-- TOC entry 4461 (class 1259 OID 17977)
-- Name: IDX_order_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_address_deleted_at" ON public.order_address USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4448 (class 1259 OID 17978)
-- Name: IDX_order_billing_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_billing_address_id" ON public."order" USING btree (billing_address_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4481 (class 1259 OID 17979)
-- Name: IDX_order_change_action_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_claim_id" ON public.order_change_action USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4482 (class 1259 OID 17980)
-- Name: IDX_order_change_action_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_deleted_at" ON public.order_change_action USING btree (deleted_at);


--
-- TOC entry 4483 (class 1259 OID 17981)
-- Name: IDX_order_change_action_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_exchange_id" ON public.order_change_action USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4484 (class 1259 OID 17982)
-- Name: IDX_order_change_action_order_change_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_order_change_id" ON public.order_change_action USING btree (order_change_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4485 (class 1259 OID 17983)
-- Name: IDX_order_change_action_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_order_id" ON public.order_change_action USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4486 (class 1259 OID 17984)
-- Name: IDX_order_change_action_ordering; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_ordering" ON public.order_change_action USING btree (ordering) WHERE (deleted_at IS NULL);


--
-- TOC entry 4487 (class 1259 OID 17985)
-- Name: IDX_order_change_action_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_return_id" ON public.order_change_action USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4470 (class 1259 OID 17986)
-- Name: IDX_order_change_change_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_change_type" ON public.order_change USING btree (change_type);


--
-- TOC entry 4471 (class 1259 OID 17987)
-- Name: IDX_order_change_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_claim_id" ON public.order_change USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4472 (class 1259 OID 17988)
-- Name: IDX_order_change_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_deleted_at" ON public.order_change USING btree (deleted_at);


--
-- TOC entry 4473 (class 1259 OID 17989)
-- Name: IDX_order_change_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_exchange_id" ON public.order_change USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4474 (class 1259 OID 17990)
-- Name: IDX_order_change_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_order_id" ON public.order_change USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4475 (class 1259 OID 17991)
-- Name: IDX_order_change_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_order_id_version" ON public.order_change USING btree (order_id, version);


--
-- TOC entry 4476 (class 1259 OID 17992)
-- Name: IDX_order_change_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_return_id" ON public.order_change USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4477 (class 1259 OID 17993)
-- Name: IDX_order_change_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_status" ON public.order_change USING btree (status) WHERE (deleted_at IS NULL);


--
-- TOC entry 4478 (class 1259 OID 17994)
-- Name: IDX_order_change_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_version" ON public.order_change USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4490 (class 1259 OID 17995)
-- Name: IDX_order_claim_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_deleted_at" ON public.order_claim USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4491 (class 1259 OID 17996)
-- Name: IDX_order_claim_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_display_id" ON public.order_claim USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4496 (class 1259 OID 17997)
-- Name: IDX_order_claim_item_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_claim_id" ON public.order_claim_item USING btree (claim_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4497 (class 1259 OID 17998)
-- Name: IDX_order_claim_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_deleted_at" ON public.order_claim_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4501 (class 1259 OID 17999)
-- Name: IDX_order_claim_item_image_claim_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_image_claim_item_id" ON public.order_claim_item_image USING btree (claim_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4502 (class 1259 OID 18000)
-- Name: IDX_order_claim_item_image_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_image_deleted_at" ON public.order_claim_item_image USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4498 (class 1259 OID 18001)
-- Name: IDX_order_claim_item_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_item_id" ON public.order_claim_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4492 (class 1259 OID 18002)
-- Name: IDX_order_claim_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_order_id" ON public.order_claim USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4493 (class 1259 OID 18003)
-- Name: IDX_order_claim_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_return_id" ON public.order_claim USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4505 (class 1259 OID 18004)
-- Name: IDX_order_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_credit_line_deleted_at" ON public.order_credit_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4506 (class 1259 OID 18005)
-- Name: IDX_order_credit_line_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_credit_line_order_id" ON public.order_credit_line USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4507 (class 1259 OID 18006)
-- Name: IDX_order_credit_line_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_credit_line_order_id_version" ON public.order_credit_line USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4449 (class 1259 OID 18007)
-- Name: IDX_order_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_currency_code" ON public."order" USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4450 (class 1259 OID 18008)
-- Name: IDX_order_custom_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_order_custom_display_id" ON public."order" USING btree (custom_display_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4451 (class 1259 OID 18009)
-- Name: IDX_order_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_customer_id" ON public."order" USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4452 (class 1259 OID 18010)
-- Name: IDX_order_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_deleted_at" ON public."order" USING btree (deleted_at);


--
-- TOC entry 4453 (class 1259 OID 18011)
-- Name: IDX_order_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_display_id" ON public."order" USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4510 (class 1259 OID 18012)
-- Name: IDX_order_exchange_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_deleted_at" ON public.order_exchange USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4511 (class 1259 OID 18013)
-- Name: IDX_order_exchange_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_display_id" ON public.order_exchange USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4516 (class 1259 OID 18014)
-- Name: IDX_order_exchange_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_item_deleted_at" ON public.order_exchange_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4517 (class 1259 OID 18015)
-- Name: IDX_order_exchange_item_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_item_exchange_id" ON public.order_exchange_item USING btree (exchange_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4518 (class 1259 OID 18016)
-- Name: IDX_order_exchange_item_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_item_item_id" ON public.order_exchange_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4512 (class 1259 OID 18017)
-- Name: IDX_order_exchange_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_order_id" ON public.order_exchange USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4513 (class 1259 OID 18018)
-- Name: IDX_order_exchange_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_return_id" ON public.order_exchange USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4467 (class 1259 OID 18019)
-- Name: IDX_order_id_-71069c16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_-71069c16" ON public.order_cart USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4552 (class 1259 OID 18020)
-- Name: IDX_order_id_-71518339; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_-71518339" ON public.order_promotion USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4524 (class 1259 OID 18021)
-- Name: IDX_order_id_-e8d2543e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_-e8d2543e" ON public.order_fulfillment USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4546 (class 1259 OID 18022)
-- Name: IDX_order_id_f42b9949; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_f42b9949" ON public.order_payment_collection USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4454 (class 1259 OID 18023)
-- Name: IDX_order_is_draft_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_is_draft_order" ON public."order" USING btree (is_draft_order) WHERE (deleted_at IS NULL);


--
-- TOC entry 4527 (class 1259 OID 18024)
-- Name: IDX_order_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_item_deleted_at" ON public.order_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4528 (class 1259 OID 18025)
-- Name: IDX_order_item_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_item_item_id" ON public.order_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4529 (class 1259 OID 18026)
-- Name: IDX_order_item_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_item_order_id" ON public.order_item USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4530 (class 1259 OID 18027)
-- Name: IDX_order_item_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_item_order_id_version" ON public.order_item USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4538 (class 1259 OID 18028)
-- Name: IDX_order_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_line_item_adjustment_item_id" ON public.order_line_item_adjustment USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4534 (class 1259 OID 18029)
-- Name: IDX_order_line_item_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_line_item_product_id" ON public.order_line_item USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4541 (class 1259 OID 18030)
-- Name: IDX_order_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_line_item_tax_line_item_id" ON public.order_line_item_tax_line USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4535 (class 1259 OID 18031)
-- Name: IDX_order_line_item_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_line_item_variant_id" ON public.order_line_item USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4455 (class 1259 OID 18032)
-- Name: IDX_order_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_region_id" ON public."order" USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4456 (class 1259 OID 18033)
-- Name: IDX_order_sales_channel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_sales_channel_id" ON public."order" USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4457 (class 1259 OID 18034)
-- Name: IDX_order_shipping_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_address_id" ON public."order" USING btree (shipping_address_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4556 (class 1259 OID 18035)
-- Name: IDX_order_shipping_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_claim_id" ON public.order_shipping USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4557 (class 1259 OID 18036)
-- Name: IDX_order_shipping_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_deleted_at" ON public.order_shipping USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4558 (class 1259 OID 18037)
-- Name: IDX_order_shipping_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_exchange_id" ON public.order_shipping USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4559 (class 1259 OID 18038)
-- Name: IDX_order_shipping_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_item_id" ON public.order_shipping USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4569 (class 1259 OID 18039)
-- Name: IDX_order_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_method_adjustment_shipping_method_id" ON public.order_shipping_method_adjustment USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4566 (class 1259 OID 18040)
-- Name: IDX_order_shipping_method_shipping_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_method_shipping_option_id" ON public.order_shipping_method USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4572 (class 1259 OID 18041)
-- Name: IDX_order_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_method_tax_line_shipping_method_id" ON public.order_shipping_method_tax_line USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4560 (class 1259 OID 18042)
-- Name: IDX_order_shipping_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_order_id" ON public.order_shipping USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4561 (class 1259 OID 18043)
-- Name: IDX_order_shipping_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_order_id_version" ON public.order_shipping USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4562 (class 1259 OID 18044)
-- Name: IDX_order_shipping_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_return_id" ON public.order_shipping USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4563 (class 1259 OID 18045)
-- Name: IDX_order_shipping_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_shipping_method_id" ON public.order_shipping USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4575 (class 1259 OID 18046)
-- Name: IDX_order_summary_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_summary_deleted_at" ON public.order_summary USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4576 (class 1259 OID 18047)
-- Name: IDX_order_summary_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_summary_order_id_version" ON public.order_summary USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4579 (class 1259 OID 18048)
-- Name: IDX_order_transaction_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_claim_id" ON public.order_transaction USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4580 (class 1259 OID 18049)
-- Name: IDX_order_transaction_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_currency_code" ON public.order_transaction USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4581 (class 1259 OID 18050)
-- Name: IDX_order_transaction_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_exchange_id" ON public.order_transaction USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4582 (class 1259 OID 18051)
-- Name: IDX_order_transaction_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_order_id" ON public.order_transaction USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4583 (class 1259 OID 18052)
-- Name: IDX_order_transaction_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_order_id_version" ON public.order_transaction USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4584 (class 1259 OID 18053)
-- Name: IDX_order_transaction_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_reference_id" ON public.order_transaction USING btree (reference_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4585 (class 1259 OID 18054)
-- Name: IDX_order_transaction_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_return_id" ON public.order_transaction USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4595 (class 1259 OID 18055)
-- Name: IDX_payment_collection_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_collection_deleted_at" ON public.payment_collection USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4296 (class 1259 OID 18056)
-- Name: IDX_payment_collection_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_collection_id_-4a39f6c9" ON public.cart_payment_collection USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4547 (class 1259 OID 18057)
-- Name: IDX_payment_collection_id_f42b9949; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_collection_id_f42b9949" ON public.order_payment_collection USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4588 (class 1259 OID 18058)
-- Name: IDX_payment_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_deleted_at" ON public.payment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4589 (class 1259 OID 18059)
-- Name: IDX_payment_payment_collection_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_payment_collection_id" ON public.payment USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4590 (class 1259 OID 18060)
-- Name: IDX_payment_payment_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_payment_session_id" ON public.payment USING btree (payment_session_id);


--
-- TOC entry 4591 (class 1259 OID 18061)
-- Name: IDX_payment_payment_session_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_payment_payment_session_id_unique" ON public.payment USING btree (payment_session_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4600 (class 1259 OID 18062)
-- Name: IDX_payment_provider_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_provider_deleted_at" ON public.payment_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4592 (class 1259 OID 18063)
-- Name: IDX_payment_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_provider_id" ON public.payment USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4800 (class 1259 OID 18064)
-- Name: IDX_payment_provider_id_1c934dab0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_provider_id_1c934dab0" ON public.region_payment_provider USING btree (payment_provider_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4603 (class 1259 OID 18065)
-- Name: IDX_payment_session_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_session_deleted_at" ON public.payment_session USING btree (deleted_at);


--
-- TOC entry 4604 (class 1259 OID 18066)
-- Name: IDX_payment_session_payment_collection_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_session_payment_collection_id" ON public.payment_session USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4607 (class 1259 OID 18067)
-- Name: IDX_price_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_currency_code" ON public.price USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4608 (class 1259 OID 18068)
-- Name: IDX_price_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_deleted_at" ON public.price USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4613 (class 1259 OID 18069)
-- Name: IDX_price_list_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_deleted_at" ON public.price_list USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4614 (class 1259 OID 18070)
-- Name: IDX_price_list_id_status_starts_at_ends_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_id_status_starts_at_ends_at" ON public.price_list USING btree (id, status, starts_at, ends_at) WHERE ((deleted_at IS NULL) AND (status = 'active'::text));


--
-- TOC entry 4617 (class 1259 OID 18071)
-- Name: IDX_price_list_rule_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_rule_attribute" ON public.price_list_rule USING btree (attribute) WHERE (deleted_at IS NULL);


--
-- TOC entry 4618 (class 1259 OID 18072)
-- Name: IDX_price_list_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_rule_deleted_at" ON public.price_list_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4619 (class 1259 OID 18073)
-- Name: IDX_price_list_rule_price_list_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_rule_price_list_id" ON public.price_list_rule USING btree (price_list_id) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4620 (class 1259 OID 18074)
-- Name: IDX_price_list_rule_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_rule_value" ON public.price_list_rule USING gin (value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4623 (class 1259 OID 18075)
-- Name: IDX_price_preference_attribute_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_price_preference_attribute_value" ON public.price_preference USING btree (attribute, value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4624 (class 1259 OID 18076)
-- Name: IDX_price_preference_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_preference_deleted_at" ON public.price_preference USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4609 (class 1259 OID 18077)
-- Name: IDX_price_price_list_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_price_list_id" ON public.price USING btree (price_list_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4610 (class 1259 OID 18078)
-- Name: IDX_price_price_set_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_price_set_id" ON public.price USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4627 (class 1259 OID 18079)
-- Name: IDX_price_rule_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_attribute" ON public.price_rule USING btree (attribute) WHERE (deleted_at IS NULL);


--
-- TOC entry 4628 (class 1259 OID 18080)
-- Name: IDX_price_rule_attribute_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_attribute_value" ON public.price_rule USING btree (attribute, value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4629 (class 1259 OID 18081)
-- Name: IDX_price_rule_attribute_value_price_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_attribute_value_price_id" ON public.price_rule USING btree (attribute, value, price_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4630 (class 1259 OID 18082)
-- Name: IDX_price_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_deleted_at" ON public.price_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4631 (class 1259 OID 18083)
-- Name: IDX_price_rule_operator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_operator" ON public.price_rule USING btree (operator);


--
-- TOC entry 4632 (class 1259 OID 18084)
-- Name: IDX_price_rule_operator_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_operator_value" ON public.price_rule USING btree (operator, value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4633 (class 1259 OID 18085)
-- Name: IDX_price_rule_price_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_price_id" ON public.price_rule USING btree (price_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4634 (class 1259 OID 18086)
-- Name: IDX_price_rule_price_id_attribute_operator_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_price_rule_price_id_attribute_operator_unique" ON public.price_rule USING btree (price_id, attribute, operator) WHERE (deleted_at IS NULL);


--
-- TOC entry 4637 (class 1259 OID 18087)
-- Name: IDX_price_set_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_set_deleted_at" ON public.price_set USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4717 (class 1259 OID 18088)
-- Name: IDX_price_set_id_52b23597; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_set_id_52b23597" ON public.product_variant_price_set USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4858 (class 1259 OID 18089)
-- Name: IDX_price_set_id_ba32fa9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_set_id_ba32fa9c" ON public.shipping_option_price_set USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4648 (class 1259 OID 18090)
-- Name: IDX_product_category_parent_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_category_parent_category_id" ON public.product_category USING btree (parent_category_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4649 (class 1259 OID 18091)
-- Name: IDX_product_category_path; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_category_path" ON public.product_category USING btree (mpath) WHERE (deleted_at IS NULL);


--
-- TOC entry 4655 (class 1259 OID 18092)
-- Name: IDX_product_collection_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_collection_deleted_at" ON public.product_collection USING btree (deleted_at);


--
-- TOC entry 4640 (class 1259 OID 18093)
-- Name: IDX_product_collection_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_collection_id" ON public.product USING btree (collection_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4641 (class 1259 OID 18094)
-- Name: IDX_product_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_deleted_at" ON public.product USING btree (deleted_at);


--
-- TOC entry 4658 (class 1259 OID 18095)
-- Name: IDX_product_detail_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_detail_deleted_at" ON public.product_detail USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4659 (class 1259 OID 18096)
-- Name: IDX_product_detail_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_detail_product_id" ON public.product_detail USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4642 (class 1259 OID 18097)
-- Name: IDX_product_handle_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_handle_unique" ON public.product USING btree (handle) WHERE (deleted_at IS NULL);


--
-- TOC entry 4684 (class 1259 OID 18098)
-- Name: IDX_product_id_17a262437; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_id_17a262437" ON public.product_shipping_profile USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4678 (class 1259 OID 18099)
-- Name: IDX_product_id_20b454295; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_id_20b454295" ON public.product_sales_channel USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4662 (class 1259 OID 18100)
-- Name: IDX_product_image_meta_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_image_meta_deleted_at" ON public.product_image_meta USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4663 (class 1259 OID 18101)
-- Name: IDX_product_image_meta_product_image; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_image_meta_product_image" ON public.product_image_meta USING btree (product_id, image_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4397 (class 1259 OID 18102)
-- Name: IDX_product_image_rank; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_image_rank" ON public.image USING btree (rank) WHERE (deleted_at IS NULL);


--
-- TOC entry 4398 (class 1259 OID 18103)
-- Name: IDX_product_image_rank_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_image_rank_product_id" ON public.image USING btree (rank, product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4399 (class 1259 OID 18104)
-- Name: IDX_product_image_url; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_image_url" ON public.image USING btree (url) WHERE (deleted_at IS NULL);


--
-- TOC entry 4400 (class 1259 OID 18105)
-- Name: IDX_product_image_url_rank_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_image_url_rank_product_id" ON public.image USING btree (url, rank, product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4667 (class 1259 OID 18106)
-- Name: IDX_product_option_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_option_deleted_at" ON public.product_option USING btree (deleted_at);


--
-- TOC entry 4668 (class 1259 OID 18107)
-- Name: IDX_product_option_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_option_product_id" ON public.product_option USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4672 (class 1259 OID 18108)
-- Name: IDX_product_option_value_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_option_value_deleted_at" ON public.product_option_value USING btree (deleted_at);


--
-- TOC entry 4673 (class 1259 OID 18109)
-- Name: IDX_product_option_value_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_option_value_option_id" ON public.product_option_value USING btree (option_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4643 (class 1259 OID 18110)
-- Name: IDX_product_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_status" ON public.product USING btree (status) WHERE (deleted_at IS NULL);


--
-- TOC entry 4688 (class 1259 OID 18111)
-- Name: IDX_product_tag_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_tag_deleted_at" ON public.product_tag USING btree (deleted_at);


--
-- TOC entry 4694 (class 1259 OID 18112)
-- Name: IDX_product_type_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_type_deleted_at" ON public.product_type USING btree (deleted_at);


--
-- TOC entry 4644 (class 1259 OID 18113)
-- Name: IDX_product_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_type_id" ON public.product USING btree (type_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4698 (class 1259 OID 18114)
-- Name: IDX_product_variant_barcode_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_variant_barcode_unique" ON public.product_variant USING btree (barcode) WHERE (deleted_at IS NULL);


--
-- TOC entry 4699 (class 1259 OID 18115)
-- Name: IDX_product_variant_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_deleted_at" ON public.product_variant USING btree (deleted_at);


--
-- TOC entry 4700 (class 1259 OID 18116)
-- Name: IDX_product_variant_ean_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_variant_ean_unique" ON public.product_variant USING btree (ean) WHERE (deleted_at IS NULL);


--
-- TOC entry 4701 (class 1259 OID 18117)
-- Name: IDX_product_variant_id_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_id_product_id" ON public.product_variant USING btree (id, product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4702 (class 1259 OID 18118)
-- Name: IDX_product_variant_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_product_id" ON public.product_variant USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4721 (class 1259 OID 18119)
-- Name: IDX_product_variant_product_image_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_product_image_deleted_at" ON public.product_variant_product_image USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4722 (class 1259 OID 18120)
-- Name: IDX_product_variant_product_image_image_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_product_image_image_id" ON public.product_variant_product_image USING btree (image_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4723 (class 1259 OID 18122)
-- Name: IDX_product_variant_product_image_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_product_image_variant_id" ON public.product_variant_product_image USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4703 (class 1259 OID 18123)
-- Name: IDX_product_variant_sku_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_variant_sku_unique" ON public.product_variant USING btree (sku) WHERE (deleted_at IS NULL);


--
-- TOC entry 4704 (class 1259 OID 18124)
-- Name: IDX_product_variant_upc_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_variant_upc_unique" ON public.product_variant USING btree (upc) WHERE (deleted_at IS NULL);


--
-- TOC entry 4737 (class 1259 OID 18125)
-- Name: IDX_promotion_application_method_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_application_method_currency_code" ON public.promotion_application_method USING btree (currency_code) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4738 (class 1259 OID 18126)
-- Name: IDX_promotion_application_method_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_application_method_deleted_at" ON public.promotion_application_method USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4739 (class 1259 OID 18127)
-- Name: IDX_promotion_application_method_promotion_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_promotion_application_method_promotion_id_unique" ON public.promotion_application_method USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4747 (class 1259 OID 18128)
-- Name: IDX_promotion_campaign_budget_campaign_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_budget_campaign_id_unique" ON public.promotion_campaign_budget USING btree (campaign_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4748 (class 1259 OID 18129)
-- Name: IDX_promotion_campaign_budget_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_budget_deleted_at" ON public.promotion_campaign_budget USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4751 (class 1259 OID 18130)
-- Name: IDX_promotion_campaign_budget_usage_attribute_value_budget_id_u; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_budget_usage_attribute_value_budget_id_u" ON public.promotion_campaign_budget_usage USING btree (attribute_value, budget_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4752 (class 1259 OID 18131)
-- Name: IDX_promotion_campaign_budget_usage_budget_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_budget_usage_budget_id" ON public.promotion_campaign_budget_usage USING btree (budget_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4753 (class 1259 OID 18132)
-- Name: IDX_promotion_campaign_budget_usage_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_budget_usage_deleted_at" ON public.promotion_campaign_budget_usage USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4742 (class 1259 OID 18133)
-- Name: IDX_promotion_campaign_campaign_identifier_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_campaign_identifier_unique" ON public.promotion_campaign USING btree (campaign_identifier) WHERE (deleted_at IS NULL);


--
-- TOC entry 4743 (class 1259 OID 18134)
-- Name: IDX_promotion_campaign_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_deleted_at" ON public.promotion_campaign USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4726 (class 1259 OID 18135)
-- Name: IDX_promotion_campaign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_id" ON public.promotion USING btree (campaign_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4727 (class 1259 OID 18136)
-- Name: IDX_promotion_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_deleted_at" ON public.promotion USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4553 (class 1259 OID 18137)
-- Name: IDX_promotion_id_-71518339; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_id_-71518339" ON public.order_promotion USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4302 (class 1259 OID 18138)
-- Name: IDX_promotion_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_id_-a9d4a70b" ON public.cart_promotion USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4728 (class 1259 OID 18139)
-- Name: IDX_promotion_is_automatic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_is_automatic" ON public.promotion USING btree (is_automatic) WHERE (deleted_at IS NULL);


--
-- TOC entry 4758 (class 1259 OID 18140)
-- Name: IDX_promotion_rule_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_attribute" ON public.promotion_rule USING btree (attribute);


--
-- TOC entry 4759 (class 1259 OID 18141)
-- Name: IDX_promotion_rule_attribute_operator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_attribute_operator" ON public.promotion_rule USING btree (attribute, operator) WHERE (deleted_at IS NULL);


--
-- TOC entry 4760 (class 1259 OID 18142)
-- Name: IDX_promotion_rule_attribute_operator_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_attribute_operator_id" ON public.promotion_rule USING btree (operator, attribute, id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4761 (class 1259 OID 18143)
-- Name: IDX_promotion_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_deleted_at" ON public.promotion_rule USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4762 (class 1259 OID 18144)
-- Name: IDX_promotion_rule_operator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_operator" ON public.promotion_rule USING btree (operator);


--
-- TOC entry 4765 (class 1259 OID 18145)
-- Name: IDX_promotion_rule_value_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_value_deleted_at" ON public.promotion_rule_value USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4766 (class 1259 OID 18146)
-- Name: IDX_promotion_rule_value_promotion_rule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_value_promotion_rule_id" ON public.promotion_rule_value USING btree (promotion_rule_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4767 (class 1259 OID 18147)
-- Name: IDX_promotion_rule_value_rule_id_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_value_rule_id_value" ON public.promotion_rule_value USING btree (promotion_rule_id, value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4768 (class 1259 OID 18148)
-- Name: IDX_promotion_rule_value_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_value_value" ON public.promotion_rule_value USING btree (value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4729 (class 1259 OID 18149)
-- Name: IDX_promotion_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_status" ON public.promotion USING btree (status) WHERE (deleted_at IS NULL);


--
-- TOC entry 4730 (class 1259 OID 18150)
-- Name: IDX_promotion_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_type" ON public.promotion USING btree (type);


--
-- TOC entry 4771 (class 1259 OID 18151)
-- Name: IDX_provider_identity_auth_identity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_provider_identity_auth_identity_id" ON public.provider_identity USING btree (auth_identity_id);


--
-- TOC entry 4772 (class 1259 OID 18152)
-- Name: IDX_provider_identity_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_provider_identity_deleted_at" ON public.provider_identity USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4773 (class 1259 OID 18153)
-- Name: IDX_provider_identity_provider_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_provider_identity_provider_entity_id" ON public.provider_identity USING btree (entity_id, provider);


--
-- TOC entry 4778 (class 1259 OID 18154)
-- Name: IDX_publishable_key_id_-1d67bae40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_publishable_key_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (publishable_key_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4923 (class 1259 OID 18155)
-- Name: IDX_rbac_role_id_64ff0c4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_rbac_role_id_64ff0c4c" ON public.user_rbac_role USING btree (rbac_role_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4782 (class 1259 OID 18156)
-- Name: IDX_refund_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_refund_deleted_at" ON public.refund USING btree (deleted_at);


--
-- TOC entry 4783 (class 1259 OID 18157)
-- Name: IDX_refund_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_refund_payment_id" ON public.refund USING btree (payment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4787 (class 1259 OID 18158)
-- Name: IDX_refund_reason_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_refund_reason_deleted_at" ON public.refund_reason USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4784 (class 1259 OID 18159)
-- Name: IDX_refund_refund_reason_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_refund_refund_reason_id" ON public.refund USING btree (refund_reason_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4793 (class 1259 OID 18160)
-- Name: IDX_region_country_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_region_country_deleted_at" ON public.region_country USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4794 (class 1259 OID 18161)
-- Name: IDX_region_country_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_region_country_region_id" ON public.region_country USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4795 (class 1259 OID 18162)
-- Name: IDX_region_country_region_id_iso_2_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_region_country_region_id_iso_2_unique" ON public.region_country USING btree (region_id, iso_2);


--
-- TOC entry 4790 (class 1259 OID 18163)
-- Name: IDX_region_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_region_deleted_at" ON public.region USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4801 (class 1259 OID 18164)
-- Name: IDX_region_id_1c934dab0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_region_id_1c934dab0" ON public.region_payment_provider USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4804 (class 1259 OID 18165)
-- Name: IDX_reservation_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_deleted_at" ON public.reservation_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4805 (class 1259 OID 18166)
-- Name: IDX_reservation_item_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_inventory_item_id" ON public.reservation_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4806 (class 1259 OID 18167)
-- Name: IDX_reservation_item_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_line_item_id" ON public.reservation_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4807 (class 1259 OID 18168)
-- Name: IDX_reservation_item_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_location_id" ON public.reservation_item USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4810 (class 1259 OID 18169)
-- Name: IDX_return_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_claim_id" ON public.return USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4811 (class 1259 OID 18170)
-- Name: IDX_return_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_display_id" ON public.return USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4812 (class 1259 OID 18171)
-- Name: IDX_return_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_exchange_id" ON public.return USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4819 (class 1259 OID 18172)
-- Name: IDX_return_id_-31ea43a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_id_-31ea43a" ON public.return_fulfillment USING btree (return_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4822 (class 1259 OID 18173)
-- Name: IDX_return_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_item_deleted_at" ON public.return_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4823 (class 1259 OID 18174)
-- Name: IDX_return_item_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_item_item_id" ON public.return_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4824 (class 1259 OID 18175)
-- Name: IDX_return_item_reason_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_item_reason_id" ON public.return_item USING btree (reason_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4825 (class 1259 OID 18176)
-- Name: IDX_return_item_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_item_return_id" ON public.return_item USING btree (return_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4813 (class 1259 OID 18177)
-- Name: IDX_return_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_order_id" ON public.return USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4828 (class 1259 OID 18178)
-- Name: IDX_return_reason_parent_return_reason_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_reason_parent_return_reason_id" ON public.return_reason USING btree (parent_return_reason_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4829 (class 1259 OID 18179)
-- Name: IDX_return_reason_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_reason_value" ON public.return_reason USING btree (value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4832 (class 1259 OID 18180)
-- Name: IDX_sales_channel_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_sales_channel_deleted_at" ON public.sales_channel USING btree (deleted_at);


--
-- TOC entry 4779 (class 1259 OID 18181)
-- Name: IDX_sales_channel_id_-1d67bae40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_sales_channel_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4679 (class 1259 OID 18182)
-- Name: IDX_sales_channel_id_20b454295; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_sales_channel_id_20b454295" ON public.product_sales_channel USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4837 (class 1259 OID 18183)
-- Name: IDX_sales_channel_id_26d06f470; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_sales_channel_id_26d06f470" ON public.sales_channel_stock_location USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4844 (class 1259 OID 18184)
-- Name: IDX_service_zone_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_service_zone_deleted_at" ON public.service_zone USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4845 (class 1259 OID 18185)
-- Name: IDX_service_zone_fulfillment_set_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_service_zone_fulfillment_set_id" ON public.service_zone USING btree (fulfillment_set_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4846 (class 1259 OID 18186)
-- Name: IDX_service_zone_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_service_zone_name_unique" ON public.service_zone USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4312 (class 1259 OID 18187)
-- Name: IDX_shipping_method_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_method_adjustment_promotion_id" ON public.cart_shipping_method_adjustment USING btree (promotion_id) WHERE ((deleted_at IS NULL) AND (promotion_id IS NOT NULL));


--
-- TOC entry 4307 (class 1259 OID 18188)
-- Name: IDX_shipping_method_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_method_option_id" ON public.cart_shipping_method USING btree (shipping_option_id) WHERE ((deleted_at IS NULL) AND (shipping_option_id IS NOT NULL));


--
-- TOC entry 4317 (class 1259 OID 18189)
-- Name: IDX_shipping_method_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_method_tax_line_tax_rate_id" ON public.cart_shipping_method_tax_line USING btree (tax_rate_id) WHERE ((deleted_at IS NULL) AND (tax_rate_id IS NOT NULL));


--
-- TOC entry 4849 (class 1259 OID 18190)
-- Name: IDX_shipping_option_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_deleted_at" ON public.shipping_option USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4859 (class 1259 OID 18191)
-- Name: IDX_shipping_option_id_ba32fa9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_id_ba32fa9c" ON public.shipping_option_price_set USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4850 (class 1259 OID 18192)
-- Name: IDX_shipping_option_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_provider_id" ON public.shipping_option USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4862 (class 1259 OID 18193)
-- Name: IDX_shipping_option_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_rule_deleted_at" ON public.shipping_option_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4863 (class 1259 OID 18194)
-- Name: IDX_shipping_option_rule_shipping_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_rule_shipping_option_id" ON public.shipping_option_rule USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4851 (class 1259 OID 18195)
-- Name: IDX_shipping_option_service_zone_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_service_zone_id" ON public.shipping_option USING btree (service_zone_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4852 (class 1259 OID 18196)
-- Name: IDX_shipping_option_shipping_option_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_shipping_option_type_id" ON public.shipping_option USING btree (shipping_option_type_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4853 (class 1259 OID 18197)
-- Name: IDX_shipping_option_shipping_profile_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_shipping_profile_id" ON public.shipping_option USING btree (shipping_profile_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4866 (class 1259 OID 18198)
-- Name: IDX_shipping_option_type_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_type_deleted_at" ON public.shipping_option_type USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4869 (class 1259 OID 18199)
-- Name: IDX_shipping_profile_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_profile_deleted_at" ON public.shipping_profile USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4685 (class 1259 OID 18200)
-- Name: IDX_shipping_profile_id_17a262437; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_profile_id_17a262437" ON public.product_shipping_profile USING btree (shipping_profile_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4870 (class 1259 OID 18201)
-- Name: IDX_shipping_profile_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_shipping_profile_name_unique" ON public.shipping_profile USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4894 (class 1259 OID 18202)
-- Name: IDX_single_default_region; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_single_default_region" ON public.tax_rate USING btree (tax_region_id) WHERE ((is_default = true) AND (deleted_at IS NULL));


--
-- TOC entry 4877 (class 1259 OID 18203)
-- Name: IDX_stock_location_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_address_deleted_at" ON public.stock_location_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4873 (class 1259 OID 18204)
-- Name: IDX_stock_location_address_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_stock_location_address_id_unique" ON public.stock_location USING btree (address_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4874 (class 1259 OID 18205)
-- Name: IDX_stock_location_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_deleted_at" ON public.stock_location USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4428 (class 1259 OID 18206)
-- Name: IDX_stock_location_id_-1e5992737; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_id_-1e5992737" ON public.location_fulfillment_provider USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4434 (class 1259 OID 18207)
-- Name: IDX_stock_location_id_-e88adb96; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_id_-e88adb96" ON public.location_fulfillment_set USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4838 (class 1259 OID 18208)
-- Name: IDX_stock_location_id_26d06f470; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_id_26d06f470" ON public.sales_channel_stock_location USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4883 (class 1259 OID 18209)
-- Name: IDX_store_currency_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_currency_deleted_at" ON public.store_currency USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4884 (class 1259 OID 18210)
-- Name: IDX_store_currency_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_currency_store_id" ON public.store_currency USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4880 (class 1259 OID 18211)
-- Name: IDX_store_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_deleted_at" ON public.store USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4887 (class 1259 OID 18212)
-- Name: IDX_store_locale_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_locale_deleted_at" ON public.store_locale USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4888 (class 1259 OID 18213)
-- Name: IDX_store_locale_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_locale_store_id" ON public.store_locale USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4689 (class 1259 OID 18214)
-- Name: IDX_tag_value_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_tag_value_unique" ON public.product_tag USING btree (value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4891 (class 1259 OID 18215)
-- Name: IDX_tax_provider_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_provider_deleted_at" ON public.tax_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4895 (class 1259 OID 18216)
-- Name: IDX_tax_rate_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_deleted_at" ON public.tax_rate USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4899 (class 1259 OID 18217)
-- Name: IDX_tax_rate_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_rule_deleted_at" ON public.tax_rate_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4900 (class 1259 OID 18218)
-- Name: IDX_tax_rate_rule_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_rule_reference_id" ON public.tax_rate_rule USING btree (reference_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4901 (class 1259 OID 18219)
-- Name: IDX_tax_rate_rule_tax_rate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_rule_tax_rate_id" ON public.tax_rate_rule USING btree (tax_rate_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4902 (class 1259 OID 18220)
-- Name: IDX_tax_rate_rule_unique_rate_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_tax_rate_rule_unique_rate_reference" ON public.tax_rate_rule USING btree (tax_rate_id, reference_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4896 (class 1259 OID 18221)
-- Name: IDX_tax_rate_tax_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_tax_region_id" ON public.tax_rate USING btree (tax_region_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4905 (class 1259 OID 18222)
-- Name: IDX_tax_region_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_region_deleted_at" ON public.tax_region USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4906 (class 1259 OID 18223)
-- Name: IDX_tax_region_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_region_parent_id" ON public.tax_region USING btree (parent_id);


--
-- TOC entry 4907 (class 1259 OID 18224)
-- Name: IDX_tax_region_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_region_provider_id" ON public.tax_region USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4908 (class 1259 OID 18225)
-- Name: IDX_tax_region_unique_country_nullable_province; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_nullable_province" ON public.tax_region USING btree (country_code) WHERE ((province_code IS NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4909 (class 1259 OID 18226)
-- Name: IDX_tax_region_unique_country_province; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_province" ON public.tax_region USING btree (country_code, province_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4695 (class 1259 OID 18227)
-- Name: IDX_type_value_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_type_value_unique" ON public.product_type USING btree (value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4731 (class 1259 OID 18228)
-- Name: IDX_unique_promotion_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_unique_promotion_code" ON public.promotion USING btree (code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4912 (class 1259 OID 18229)
-- Name: IDX_user_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_deleted_at" ON public."user" USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4913 (class 1259 OID 18230)
-- Name: IDX_user_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_user_email_unique" ON public."user" USING btree (email) WHERE (deleted_at IS NULL);


--
-- TOC entry 4924 (class 1259 OID 18231)
-- Name: IDX_user_id_64ff0c4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_id_64ff0c4c" ON public.user_rbac_role USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4916 (class 1259 OID 18232)
-- Name: IDX_user_preference_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_preference_deleted_at" ON public.user_preference USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4917 (class 1259 OID 18233)
-- Name: IDX_user_preference_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_preference_user_id" ON public.user_preference USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4918 (class 1259 OID 18234)
-- Name: IDX_user_preference_user_id_key_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_user_preference_user_id_key_unique" ON public.user_preference USING btree (user_id, key) WHERE (deleted_at IS NULL);


--
-- TOC entry 4710 (class 1259 OID 18235)
-- Name: IDX_variant_id_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_variant_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4718 (class 1259 OID 18236)
-- Name: IDX_variant_id_52b23597; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_variant_id_52b23597" ON public.product_variant_price_set USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4927 (class 1259 OID 18237)
-- Name: IDX_view_configuration_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_view_configuration_deleted_at" ON public.view_configuration USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4928 (class 1259 OID 18238)
-- Name: IDX_view_configuration_entity_is_system_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_view_configuration_entity_is_system_default" ON public.view_configuration USING btree (entity, is_system_default) WHERE (deleted_at IS NULL);


--
-- TOC entry 4929 (class 1259 OID 18239)
-- Name: IDX_view_configuration_entity_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_view_configuration_entity_user_id" ON public.view_configuration USING btree (entity, user_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4930 (class 1259 OID 18240)
-- Name: IDX_view_configuration_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_view_configuration_user_id" ON public.view_configuration USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4933 (class 1259 OID 18241)
-- Name: IDX_workflow_execution_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_deleted_at" ON public.workflow_execution USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4934 (class 1259 OID 18242)
-- Name: IDX_workflow_execution_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_id" ON public.workflow_execution USING btree (id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4935 (class 1259 OID 18243)
-- Name: IDX_workflow_execution_retention_time_updated_at_state; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_retention_time_updated_at_state" ON public.workflow_execution USING btree (retention_time, updated_at, state) WHERE ((deleted_at IS NULL) AND (retention_time IS NOT NULL));


--
-- TOC entry 4936 (class 1259 OID 18244)
-- Name: IDX_workflow_execution_run_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_run_id" ON public.workflow_execution USING btree (run_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4937 (class 1259 OID 18245)
-- Name: IDX_workflow_execution_state; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_state" ON public.workflow_execution USING btree (state) WHERE (deleted_at IS NULL);


--
-- TOC entry 4938 (class 1259 OID 18246)
-- Name: IDX_workflow_execution_state_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_state_updated_at" ON public.workflow_execution USING btree (state, updated_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4939 (class 1259 OID 18247)
-- Name: IDX_workflow_execution_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_transaction_id" ON public.workflow_execution USING btree (transaction_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4940 (class 1259 OID 18248)
-- Name: IDX_workflow_execution_updated_at_retention_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_updated_at_retention_time" ON public.workflow_execution USING btree (updated_at, retention_time) WHERE ((deleted_at IS NULL) AND (retention_time IS NOT NULL) AND ((state)::text = ANY (ARRAY[('done'::character varying)::text, ('failed'::character varying)::text, ('reverted'::character varying)::text])));


--
-- TOC entry 4941 (class 1259 OID 18249)
-- Name: IDX_workflow_execution_workflow_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_workflow_id" ON public.workflow_execution USING btree (workflow_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4942 (class 1259 OID 18250)
-- Name: IDX_workflow_execution_workflow_id_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_workflow_id_transaction_id" ON public.workflow_execution USING btree (workflow_id, transaction_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4943 (class 1259 OID 18251)
-- Name: IDX_workflow_execution_workflow_id_transaction_id_run_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_workflow_execution_workflow_id_transaction_id_run_id_unique" ON public.workflow_execution USING btree (workflow_id, transaction_id, run_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4391 (class 1259 OID 18252)
-- Name: homepage_content_handle_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX homepage_content_handle_unique ON public.homepage_content USING btree (handle) WHERE (deleted_at IS NULL);


--
-- TOC entry 4394 (class 1259 OID 18253)
-- Name: homepage_content_site_active_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX homepage_content_site_active_published ON public.homepage_content USING btree (site_key) WHERE ((deleted_at IS NULL) AND (is_active = true));


--
-- TOC entry 4841 (class 1259 OID 18254)
-- Name: idx_script_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_script_name_unique ON public.script_migrations USING btree (script_name);


--
-- TOC entry 5030 (class 2606 OID 18255)
-- Name: tax_rate_rule FK_tax_rate_rule_tax_rate_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_rate_rule
    ADD CONSTRAINT "FK_tax_rate_rule_tax_rate_id" FOREIGN KEY (tax_rate_id) REFERENCES public.tax_rate(id) ON DELETE CASCADE;


--
-- TOC entry 5029 (class 2606 OID 18260)
-- Name: tax_rate FK_tax_rate_tax_region_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_rate
    ADD CONSTRAINT "FK_tax_rate_tax_region_id" FOREIGN KEY (tax_region_id) REFERENCES public.tax_region(id) ON DELETE CASCADE;


--
-- TOC entry 5031 (class 2606 OID 18265)
-- Name: tax_region FK_tax_region_parent_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT "FK_tax_region_parent_id" FOREIGN KEY (parent_id) REFERENCES public.tax_region(id) ON DELETE CASCADE;


--
-- TOC entry 5032 (class 2606 OID 18270)
-- Name: tax_region FK_tax_region_provider_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT "FK_tax_region_provider_id" FOREIGN KEY (provider_id) REFERENCES public.tax_provider(id) ON DELETE SET NULL;


--
-- TOC entry 4946 (class 2606 OID 18275)
-- Name: application_method_buy_rules application_method_buy_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4947 (class 2606 OID 18280)
-- Name: application_method_buy_rules application_method_buy_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4948 (class 2606 OID 18285)
-- Name: application_method_target_rules application_method_target_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4949 (class 2606 OID 18290)
-- Name: application_method_target_rules application_method_target_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4950 (class 2606 OID 18295)
-- Name: capture capture_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capture
    ADD CONSTRAINT capture_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4951 (class 2606 OID 18300)
-- Name: cart cart_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.cart_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4954 (class 2606 OID 18305)
-- Name: cart_line_item_adjustment cart_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item_adjustment
    ADD CONSTRAINT cart_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4953 (class 2606 OID 18310)
-- Name: cart_line_item cart_line_item_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item
    ADD CONSTRAINT cart_line_item_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4955 (class 2606 OID 18315)
-- Name: cart_line_item_tax_line cart_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item_tax_line
    ADD CONSTRAINT cart_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4952 (class 2606 OID 18320)
-- Name: cart cart_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.cart_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4957 (class 2606 OID 18325)
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method_adjustment
    ADD CONSTRAINT cart_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4956 (class 2606 OID 18330)
-- Name: cart_shipping_method cart_shipping_method_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method
    ADD CONSTRAINT cart_shipping_method_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4958 (class 2606 OID 18335)
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method_tax_line
    ADD CONSTRAINT cart_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4959 (class 2606 OID 18340)
-- Name: credit_line credit_line_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_line
    ADD CONSTRAINT credit_line_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE;


--
-- TOC entry 4960 (class 2606 OID 18345)
-- Name: customer_address customer_address_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customer_address_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4961 (class 2606 OID 18350)
-- Name: customer_group_customer customer_group_customer_customer_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_customer_group_id_foreign FOREIGN KEY (customer_group_id) REFERENCES public.customer_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4962 (class 2606 OID 18355)
-- Name: customer_group_customer customer_group_customer_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4963 (class 2606 OID 18360)
-- Name: fulfillment fulfillment_delivery_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_delivery_address_id_foreign FOREIGN KEY (delivery_address_id) REFERENCES public.fulfillment_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4966 (class 2606 OID 18365)
-- Name: fulfillment_item fulfillment_item_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4967 (class 2606 OID 18370)
-- Name: fulfillment_label fulfillment_label_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_label
    ADD CONSTRAINT fulfillment_label_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4964 (class 2606 OID 18375)
-- Name: fulfillment fulfillment_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4965 (class 2606 OID 18380)
-- Name: fulfillment fulfillment_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4968 (class 2606 OID 18385)
-- Name: geo_zone geo_zone_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.geo_zone
    ADD CONSTRAINT geo_zone_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4969 (class 2606 OID 18390)
-- Name: image image_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4970 (class 2606 OID 18395)
-- Name: inventory_level inventory_level_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4971 (class 2606 OID 18400)
-- Name: notification notification_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.notification_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4972 (class 2606 OID 18405)
-- Name: order order_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.order_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4975 (class 2606 OID 18410)
-- Name: order_change_action order_change_action_order_change_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change_action
    ADD CONSTRAINT order_change_action_order_change_id_foreign FOREIGN KEY (order_change_id) REFERENCES public.order_change(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4974 (class 2606 OID 18415)
-- Name: order_change order_change_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change
    ADD CONSTRAINT order_change_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4976 (class 2606 OID 18420)
-- Name: order_credit_line order_credit_line_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_credit_line
    ADD CONSTRAINT order_credit_line_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4977 (class 2606 OID 18425)
-- Name: order_item order_item_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4978 (class 2606 OID 18430)
-- Name: order_item order_item_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4980 (class 2606 OID 18435)
-- Name: order_line_item_adjustment order_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item_adjustment
    ADD CONSTRAINT order_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4981 (class 2606 OID 18440)
-- Name: order_line_item_tax_line order_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item_tax_line
    ADD CONSTRAINT order_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4979 (class 2606 OID 18445)
-- Name: order_line_item order_line_item_totals_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item
    ADD CONSTRAINT order_line_item_totals_id_foreign FOREIGN KEY (totals_id) REFERENCES public.order_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4973 (class 2606 OID 18450)
-- Name: order order_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.order_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4983 (class 2606 OID 18455)
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method_adjustment
    ADD CONSTRAINT order_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4984 (class 2606 OID 18460)
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method_tax_line
    ADD CONSTRAINT order_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4982 (class 2606 OID 18465)
-- Name: order_shipping order_shipping_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4985 (class 2606 OID 18470)
-- Name: order_summary order_summary_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_summary
    ADD CONSTRAINT order_summary_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4986 (class 2606 OID 18475)
-- Name: order_transaction order_transaction_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_transaction
    ADD CONSTRAINT order_transaction_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4988 (class 2606 OID 18480)
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_col_aa276_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_payment_col_aa276_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4989 (class 2606 OID 18485)
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_pro_2d555_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_payment_pro_2d555_foreign FOREIGN KEY (payment_provider_id) REFERENCES public.payment_provider(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4987 (class 2606 OID 18490)
-- Name: payment payment_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 18495)
-- Name: payment_session payment_session_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_session
    ADD CONSTRAINT payment_session_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4993 (class 2606 OID 18500)
-- Name: price_list_rule price_list_rule_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list_rule
    ADD CONSTRAINT price_list_rule_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4991 (class 2606 OID 18505)
-- Name: price price_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4992 (class 2606 OID 18510)
-- Name: price price_price_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_price_set_id_foreign FOREIGN KEY (price_set_id) REFERENCES public.price_set(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4994 (class 2606 OID 18515)
-- Name: price_rule price_rule_price_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rule
    ADD CONSTRAINT price_rule_price_id_foreign FOREIGN KEY (price_id) REFERENCES public.price(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4997 (class 2606 OID 18520)
-- Name: product_category product_category_parent_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_parent_category_id_foreign FOREIGN KEY (parent_category_id) REFERENCES public.product_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4998 (class 2606 OID 18525)
-- Name: product_category_product product_category_product_product_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_product_category_id_foreign FOREIGN KEY (product_category_id) REFERENCES public.product_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4999 (class 2606 OID 18530)
-- Name: product_category_product product_category_product_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4995 (class 2606 OID 18535)
-- Name: product product_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_collection_id_foreign FOREIGN KEY (collection_id) REFERENCES public.product_collection(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5000 (class 2606 OID 18540)
-- Name: product_option product_option_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option
    ADD CONSTRAINT product_option_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5001 (class 2606 OID 18545)
-- Name: product_option_value product_option_value_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_value
    ADD CONSTRAINT product_option_value_option_id_foreign FOREIGN KEY (option_id) REFERENCES public.product_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5002 (class 2606 OID 18550)
-- Name: product_tags product_tags_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5003 (class 2606 OID 18555)
-- Name: product_tags product_tags_product_tag_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_tag_id_foreign FOREIGN KEY (product_tag_id) REFERENCES public.product_tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4996 (class 2606 OID 18560)
-- Name: product product_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_type_id_foreign FOREIGN KEY (type_id) REFERENCES public.product_type(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5005 (class 2606 OID 18565)
-- Name: product_variant_option product_variant_option_option_value_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_option_value_id_foreign FOREIGN KEY (option_value_id) REFERENCES public.product_option_value(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5006 (class 2606 OID 18570)
-- Name: product_variant_option product_variant_option_variant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_variant_id_foreign FOREIGN KEY (variant_id) REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5004 (class 2606 OID 18575)
-- Name: product_variant product_variant_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT product_variant_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5007 (class 2606 OID 18580)
-- Name: product_variant_product_image product_variant_product_image_image_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_product_image
    ADD CONSTRAINT product_variant_product_image_image_id_foreign FOREIGN KEY (image_id) REFERENCES public.image(id) ON DELETE CASCADE;


--
-- TOC entry 5009 (class 2606 OID 18585)
-- Name: promotion_application_method promotion_application_method_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_application_method
    ADD CONSTRAINT promotion_application_method_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 18590)
-- Name: promotion_campaign_budget promotion_campaign_budget_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign_budget
    ADD CONSTRAINT promotion_campaign_budget_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5011 (class 2606 OID 18595)
-- Name: promotion_campaign_budget_usage promotion_campaign_budget_usage_budget_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign_budget_usage
    ADD CONSTRAINT promotion_campaign_budget_usage_budget_id_foreign FOREIGN KEY (budget_id) REFERENCES public.promotion_campaign_budget(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 18600)
-- Name: promotion promotion_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion
    ADD CONSTRAINT promotion_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5012 (class 2606 OID 18605)
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5013 (class 2606 OID 18610)
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5014 (class 2606 OID 18615)
-- Name: promotion_rule_value promotion_rule_value_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rule_value
    ADD CONSTRAINT promotion_rule_value_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5015 (class 2606 OID 18620)
-- Name: provider_identity provider_identity_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_identity
    ADD CONSTRAINT provider_identity_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5016 (class 2606 OID 18625)
-- Name: refund refund_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5017 (class 2606 OID 18630)
-- Name: region_country region_country_region_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.region_country
    ADD CONSTRAINT region_country_region_id_foreign FOREIGN KEY (region_id) REFERENCES public.region(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5018 (class 2606 OID 18635)
-- Name: reservation_item reservation_item_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5019 (class 2606 OID 18640)
-- Name: return_reason return_reason_parent_return_reason_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reason
    ADD CONSTRAINT return_reason_parent_return_reason_id_foreign FOREIGN KEY (parent_return_reason_id) REFERENCES public.return_reason(id);


--
-- TOC entry 5020 (class 2606 OID 18645)
-- Name: service_zone service_zone_fulfillment_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_zone
    ADD CONSTRAINT service_zone_fulfillment_set_id_foreign FOREIGN KEY (fulfillment_set_id) REFERENCES public.fulfillment_set(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5021 (class 2606 OID 18650)
-- Name: shipping_option shipping_option_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5025 (class 2606 OID 18655)
-- Name: shipping_option_rule shipping_option_rule_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option_rule
    ADD CONSTRAINT shipping_option_rule_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5022 (class 2606 OID 18660)
-- Name: shipping_option shipping_option_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5023 (class 2606 OID 18665)
-- Name: shipping_option shipping_option_shipping_option_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_shipping_option_type_id_foreign FOREIGN KEY (shipping_option_type_id) REFERENCES public.shipping_option_type(id) ON UPDATE CASCADE;


--
-- TOC entry 5024 (class 2606 OID 18670)
-- Name: shipping_option shipping_option_shipping_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_shipping_profile_id_foreign FOREIGN KEY (shipping_profile_id) REFERENCES public.shipping_profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5026 (class 2606 OID 18675)
-- Name: stock_location stock_location_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_location
    ADD CONSTRAINT stock_location_address_id_foreign FOREIGN KEY (address_id) REFERENCES public.stock_location_address(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5027 (class 2606 OID 18680)
-- Name: store_currency store_currency_store_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_currency
    ADD CONSTRAINT store_currency_store_id_foreign FOREIGN KEY (store_id) REFERENCES public.store(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5028 (class 2606 OID 18685)
-- Name: store_locale store_locale_store_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_locale
    ADD CONSTRAINT store_locale_store_id_foreign FOREIGN KEY (store_id) REFERENCES public.store(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-04-06 23:41:12

--
-- PostgreSQL database dump complete
--

\unrestrict J1ZpnzhnwkOUZFGbqHiQGJaja8WHPwIJqkv7r5ApGs0Kuloc3xMHuasVl6tzgwS

-- Completed on 2026-04-06 23:41:12

--
-- PostgreSQL database cluster dump complete
--

