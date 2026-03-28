CREATE TABLE public.course (
	id text NOT NULL,
	product_id text NULL,
	handle text NOT NULL,
	title text NOT NULL,
	description text NULL,
	thumbnail_url text NULL,
	"level" text NULL,
	lessons_count int4 DEFAULT 0 NOT NULL,
	status text DEFAULT 'published'::text NOT NULL,
	metadata jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT course_pkey PRIMARY KEY (id)
);
CREATE INDEX "IDX_course_deleted_at" ON public.course USING btree (deleted_at) WHERE (deleted_at IS NULL);


CREATE TABLE public.course_purchase (
	id text NOT NULL,
	customer_id text NOT NULL,
	course_id text NOT NULL,
	order_id text NULL,
	metadata jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT course_purchase_pkey PRIMARY KEY (id)
);
CREATE INDEX "IDX_course_purchase_deleted_at" ON public.course_purchase USING btree (deleted_at) WHERE (deleted_at IS NULL);


CREATE TABLE public.lesson (
	id text NOT NULL,
	course_id text NOT NULL,
	title text NOT NULL,
	description text NULL,
	episode_number int4 NOT NULL,
	duration int4 DEFAULT 0 NOT NULL,
	is_free bool DEFAULT false NOT NULL,
	thumbnail_url text NULL,
	video_url text NULL,
	status text DEFAULT 'published'::text NOT NULL,
	metadata jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT lesson_pkey PRIMARY KEY (id)
);
CREATE INDEX "IDX_lesson_deleted_at" ON public.lesson USING btree (deleted_at) WHERE (deleted_at IS NULL);


# 默认原始表
CREATE TABLE public.product (
	id text NOT NULL,
	title text NOT NULL,
	handle text NOT NULL,
	subtitle text NULL,
	description text NULL,
	is_giftcard bool DEFAULT false NOT NULL,
	status text DEFAULT 'draft'::text NOT NULL,
	thumbnail text NULL,
	weight text NULL,
	length text NULL,
	height text NULL,
	width text NULL,
	origin_country text NULL,
	hs_code text NULL,
	mid_code text NULL,
	material text NULL,
	collection_id text NULL,
	type_id text NULL,
	discountable bool DEFAULT true NOT NULL,
	external_id text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	metadata jsonb NULL,
	CONSTRAINT product_pkey PRIMARY KEY (id),
	CONSTRAINT product_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'proposed'::text, 'published'::text, 'rejected'::text]))),
	CONSTRAINT product_collection_id_foreign FOREIGN KEY (collection_id) REFERENCES public.product_collection(id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT product_type_id_foreign FOREIGN KEY (type_id) REFERENCES public.product_type(id) ON DELETE SET NULL ON UPDATE CASCADE
);
