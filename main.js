(function () {
	const $ = (s) => document.querySelector(s),
		$$ = (s) => [...document.querySelectorAll(s)];
	const RM = matchMedia("(prefers-reduced-motion: reduce)").matches,
		FINE = matchMedia("(pointer:fine)").matches;
	const EVENT = new Date("2026-11-21T11:30:00+05:30").getTime(),
		p2 = (n) => String(n).padStart(2, "0");

	/* split headings into masked words, split hero into letters */
	$$(".sp").forEach((h) => {
		const out = [];
		h.childNodes.forEach((n) => {
			const em = n.nodeName === "EM";
			(n.textContent.match(/\S+/g) || []).forEach((w) =>
				out.push(
					`<span class="w"${""}>${em ? "<em>" : ""}<i>${w}</i>${em ? "</em>" : ""}</span> `,
				),
			);
		});
		h.setAttribute("aria-label", h.textContent);
		h.innerHTML = out.join("");
	});
	$$("h1 .ln").forEach((l) => {
		l.innerHTML = [...l.textContent]
			.map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`)
			.join("");
	});

	/* countdown chip + ticket countdown */
	function tick() {
		const l = Math.max(0, EVENT - Date.now());
		[
			Math.floor(l / 864e5),
			Math.floor((l % 864e5) / 36e5),
			Math.floor((l % 36e5) / 6e4),
			Math.floor((l % 6e4) / 1e3),
		].forEach((v, i) => {
			const e = $("#d" + i),
				t = p2(v);
			if (e.textContent !== t) {
				e.textContent = t;
				if (i === 3 && !RM && window.gsap)
					gsap.fromTo(
						e,
						{ yPercent: 40, opacity: 0 },
						{
							yPercent: 0,
							opacity: 1,
							duration: 0.5,
							ease: "expo.out",
						},
					);
			}
		});
		const c = $("#chip"),
			d = Math.ceil(l / 864e5);
		c.hidden = false;
		c.lastElementChild.textContent =
			l <= 0
				? "Curtain’s up"
				: d + (d === 1 ? " day to go" : " days to go");
	}
	tick();
	setInterval(tick, 1000);

	/* ticket: serial, barcode, stamp */
	let stream = "dp";
	function serial() {
		const v = $("#guest").value.trim().toUpperCase();
		if (!v) return "TFW-2026-075";
		let h = 0;
		for (const c of v) h = ((h * 31 + c.charCodeAt(0)) % 900) + 100;
		return "TFW-" + (stream === "dp" ? "DP" : "AL") + "-" + h;
	}
	function draw() {
		const s = serial();
		$("#sn").textContent = s;
		let h = 2166136261;
		for (const c of s) {
			h ^= c.charCodeAt(0);
			h = Math.imul(h, 16777619);
		}
		h = h || 1;
		const r = () => {
			h ^= h << 13;
			h ^= h >>> 17;
			h ^= h << 5;
			return (h >>> 0) / 4294967296;
		};
		$("#bc").innerHTML = Array.from(
			{ length: 40 },
			() =>
				`<i style="flex:${1 + Math.floor(r() * 3)} 1 0"></i><s style="flex:${1 + Math.floor(r() * 2)} 1 0"></s>`,
		).join("");
		if (window.gsap && !RM)
			gsap.from("#bc i", {
				scaleY: 0,
				duration: 0.4,
				stagger: 0.01,
				ease: "expo.out",
			});
	}
	let stamped = false;
	$("#guest").addEventListener("input", (e) => {
		const on = !!e.target.value.trim();
		if (on !== stamped) {
			stamped = on;
			if (window.gsap && !RM)
				on
					? gsap.fromTo(
							"#st",
							{
								opacity: 0,
								scale: 2.4,
								rotation: -26,
							},
							{
								opacity: 0.92,
								scale: 1,
								rotation: -11,
								duration: 0.5,
								ease: "back.out(2.2)",
							},
						)
					: gsap.to("#st", {
							opacity: 0,
							duration: 0.25,
						});
			else $("#st").style.opacity = on ? 0.92 : 0;
		}
		draw();
	});
	$$("#sb button").forEach((b) =>
		b.addEventListener("click", () => {
			stream = b.dataset.v;
			$("#sb").dataset.v = stream;
			$$("#sb button").forEach((x) =>
				x.setAttribute("aria-pressed", x === b),
			);
			draw();
		}),
	);
	draw();

	/* copy + calendar */
	function burst(x, y) {
		if (RM || !window.gsap) return;
		const cols = ["#e4442a", "#f6b21a", "#f5eddb", "#16634f", "#e9718f"];
		for (let i = 0; i < 36; i++) {
			const e = document.createElement("i");
			e.className = "pc";
			e.style.cssText = `left:${x}px;top:${y}px;background:${cols[i % 5]}`;
			document.body.appendChild(e);
			const a = -Math.PI * (0.08 + Math.random() * 0.84),
				d = 110 + Math.random() * 190;
			gsap.timeline({ onComplete: () => e.remove() })
				.to(e, {
					x: Math.cos(a) * d,
					y: Math.sin(a) * d,
					rotation: (Math.random() - 0.5) * 720,
					duration: 0.6,
					ease: "power2.out",
				})
				.to(e, {
					y: "+=170",
					opacity: 0,
					duration: 0.9,
					ease: "power2.in",
				});
		}
	}
	$("#cp").addEventListener("click", (e) => {
		html2canvas(document.querySelector(".ticket")).then((canvas) => {
			const link = document.createElement("a");
			link.download = "page-screenshot.png";
			link.href = canvas.toDataURL("image/png");
			link.click();

			b.textContent = "Saved to photos!";
			burst(r.left + r.width / 2, r.top + r.height / 2);
			setTimeout(() => (b.textContent = "Download ticket"), 2400);
		});
	});
	$("#ics").addEventListener("click", () => {
		const L = [
			"BEGIN:VCALENDAR",
			"VERSION:2.0",
			"PRODID:-//Madras Farewell 2026//EN",
			"BEGIN:VEVENT",
			"UID:madras-farewell-2026@class-of-2026",
			"DTSTAMP:" +
				new Date()
					.toISOString()
					.replace(/[-:]/g, "")
					.replace(/\.\d{3}/, ""),
			"DTSTART:20261121T060000Z",
			"DTEND:20261121T103000Z",
			"SUMMARY:Last show\\, full house: Madras Farewell 2026",
			"LOCATION:Kaleidoscope Auditorium\\, Chennai",
			"DESCRIPTION:Doors open 11:30 AM. Dress code: Madras\\, 1975.",
			"BEGIN:VALARM",
			"TRIGGER:-P1D",
			"ACTION:DISPLAY",
			"DESCRIPTION:Last show\\, full house is tomorrow",
			"END:VALARM",
			"END:VEVENT",
			"END:VCALENDAR",
		];
		const a = document.createElement("a");
		a.href = URL.createObjectURL(
			new Blob([L.join("\r\n")], { type: "text/calendar" }),
		);
		a.download = "madras-farewell-2026.ics";
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
	});

	/* hero dust: soft drifting gold motes */
	(function () {
		const c = $("#fx"),
			x = c.getContext("2d");
		let w,
			h,
			P = [];
		const dpr = Math.min(devicePixelRatio || 1, 2);
		function rs() {
			w = c.clientWidth;
			h = c.clientHeight;
			c.width = w * dpr;
			c.height = h * dpr;
			x.setTransform(dpr, 0, 0, dpr, 0, 0);
			P = Array.from({ length: Math.round(w / 22) }, () => ({
				x: Math.random() * w,
				y: Math.random() * h,
				r: Math.random() * 2.2 + 0.6,
				v: Math.random() * 0.25 + 0.08,
				p: Math.random() * 6.28,
			}));
		}
		rs();
		addEventListener("resize", rs);
		function f(t) {
			x.clearRect(0, 0, w, h);
			for (const p of P) {
				p.y -= p.v;
				p.x += Math.sin(t / 2000 + p.p) * 0.18;
				if (p.y < -10) {
					p.y = h + 10;
					p.x = Math.random() * w;
				}
				const a = 0.25 + 0.35 * Math.sin(t / 900 + p.p);
				const g = x.createRadialGradient(
					p.x,
					p.y,
					0,
					p.x,
					p.y,
					p.r * 5,
				);
				g.addColorStop(0, `rgba(255,226,160,${a})`);
				g.addColorStop(1, "rgba(255,226,160,0)");
				x.fillStyle = g;
				x.beginPath();
				x.arc(p.x, p.y, p.r * 5, 0, 6.28);
				x.fill();
			}
			if (!RM) requestAnimationFrame(f);
		}
		requestAnimationFrame(f);
	})();

	if (!window.gsap || !window.ScrollTrigger || RM) {
		return;
	}
	gsap.registerPlugin(ScrollTrigger);

	/* smooth scroll */
	if (window.Lenis) {
		const l = new Lenis({ lerp: 0.09 });
		l.on("scroll", ScrollTrigger.update);
		gsap.ticker.add((t) => l.raf(t * 1000));
		gsap.ticker.lagSmoothing(0);
		$$('a[href^="#"]').forEach((a) =>
			a.addEventListener("click", (e) => {
				const t = $(a.getAttribute("href"));
				if (t) {
					e.preventDefault();
					l.scrollTo(t);
				}
			}),
		);
	}
	gsap.to("#bar", {
		scaleX: 1,
		ease: "none",
		scrollTrigger: { scrub: 0.3, start: 0, end: "max" },
	});

	/* the one orchestrated moment: curtain-less title rise, spotlight and seal */
	gsap.set(".ch", { yPercent: 118, rotation: 8 });
	gsap.set([".meta", ".hf"], { opacity: 0, y: 24 });
	gsap.set(".seal", { scale: 0.6, opacity: 0 });
	gsap.set(".lit,.dim", { opacity: 0 });
	gsap.timeline({ defaults: { ease: "expo.out" } })
		.to(".dim", { opacity: 0.28, duration: 2 }, 0)
		.to(".lit", { opacity: 1, duration: 2.4 }, 0.2)
		.to(
			".ch",
			{
				yPercent: 0,
				rotation: 0,
				duration: 1.5,
				stagger: 0.045,
			},
			0.4,
		)
		.to(".meta", { opacity: 1, y: 0, duration: 1.2 }, 1.2)
		.to(".hf", { opacity: 1, y: 0, duration: 1.4 }, 1.5)
		.to(".seal", { scale: 1, opacity: 1, duration: 1.6 }, 1.6);
	gsap.to(".seal", {
		rotation: 140,
		ease: "none",
		scrollTrigger: {
			trigger: "#top",
			scrub: true,
			start: "top top",
			end: "bottom top",
		},
	});
	gsap.to(".lit .plaid,.dim .plaid", {
		yPercent: 12,
		ease: "none",
		scrollTrigger: {
			trigger: "#top",
			scrub: true,
			start: "top top",
			end: "bottom top",
		},
	});
	gsap.to(".stage", {
		yPercent: -8,
		opacity: 0.2,
		ease: "none",
		scrollTrigger: {
			trigger: "#top",
			scrub: true,
			start: "top top",
			end: "bottom 20%",
		},
	});
	const hero = $("#top"),
		qx = gsap.quickTo(hero, "--x", {
			duration: 1.1,
			ease: "power3",
		}),
		qy = gsap.quickTo(hero, "--y", {
			duration: 1.1,
			ease: "power3",
		});
	let hov = false;
	if (FINE) {
		hero.addEventListener("pointermove", (e) => {
			hov = true;
			const r = hero.getBoundingClientRect();
			qx(e.clientX - r.left + "px");
			qy(e.clientY - r.top + "px");
		});
		hero.addEventListener("pointerleave", () => (hov = false));
	}
	gsap.ticker.add((t) => {
		if (hov) return;
		const r = hero.getBoundingClientRect();
		if (r.bottom < 0) return;
		qx(r.width * (0.58 + 0.28 * Math.sin(t / 2.8)) + "px");
		qy(r.height * (0.45 + 0.18 * Math.cos(t / 3.4)) + "px");
	});

	/* headings */
	$$(".sp").forEach((h) =>
		gsap.from(h.querySelectorAll(".w i"), {
			yPercent: 112,
			rotation: 5,
			duration: 1.1,
			stagger: 0.07,
			ease: "expo.out",
			scrollTrigger: {
				trigger: h,
				start: "top 85%",
				once: true,
			},
		}),
	);
	gsap.to("#gh", {
		yPercent: 22,
		rotation: 6,
		ease: "none",
		scrollTrigger: { trigger: "#details", scrub: true },
	});
	gsap.from(".fact", {
		opacity: 0,
		y: 26,
		stagger: 0.14,
		duration: 0.9,
		ease: "expo.out",
		scrollTrigger: {
			trigger: ".facts",
			start: "top 85%",
			once: true,
		},
	});

	/* marquee, driven by scroll speed + direction */
	$$(".row").forEach((r, i) => {
		r._tw = gsap.fromTo(
			r,
			{ xPercent: i ? -25 : 0 },
			{
				xPercent: i ? 0 : -25,
				duration: 26,
				ease: "none",
				repeat: -1,
			},
		);
	});
	ScrollTrigger.create({
		onUpdate: (s) => {
			const v = s.getVelocity();
			$$(".row").forEach((r) =>
				gsap.to(r._tw, {
					timeScale:
						(s.direction || 1) *
						(1 + Math.min(Math.abs(v) / 350, 6)),
					duration: 0.4,
					overwrite: true,
				}),
			);
		},
	});

	/* pinned horizontal programme */
	const trk = $(".track"),
		dist = () => trk.scrollWidth - innerWidth;
	gsap.to(trk, {
		x: () => -dist(),
		ease: "none",
		scrollTrigger: {
			trigger: "#prog",
			pin: true,
			scrub: 0.8,
			end: () => "+=" + dist(),
			invalidateOnRefresh: true,
			onUpdate: (s) => gsap.set(".pbar i", { scaleX: s.progress }),
		},
	});
	$$(".card .n").forEach((n) =>
		gsap.fromTo(
			n,
			{ xPercent: -12 },
			{
				xPercent: 12,
				ease: "none",
				scrollTrigger: {
					trigger: "#prog",
					scrub: true,
					start: "top top",
					end: () => "+=" + dist(),
				},
			},
		),
	);

	/* dress: parallax + 3D tilt */
	$$(".frame").forEach((f) => {
		const a = f.querySelector(".art");
		gsap.fromTo(
			a,
			{ yPercent: -9 },
			{
				yPercent: 9,
				ease: "none",
				scrollTrigger: { trigger: f, scrub: true },
			},
		);
		gsap.from(f, {
			clipPath: "inset(100% 0 0 0)",
			duration: 1.4,
			ease: "expo.out",
			scrollTrigger: {
				trigger: f,
				start: "top 88%",
				once: true,
			},
		});
		if (FINE) {
			f.addEventListener("pointermove", (e) => {
				const r = f.getBoundingClientRect();
				gsap.to(f, {
					rotateY: ((e.clientX - r.left) / r.width - 0.5) * 10,
					rotateX: ((e.clientY - r.top) / r.height - 0.5) * -8,
					transformPerspective: 900,
					duration: 0.5,
					overwrite: "auto",
				});
			});
			f.addEventListener("pointerleave", () =>
				gsap.to(f, {
					rotateX: 0,
					rotateY: 0,
					duration: 0.8,
					ease: "expo.out",
				}),
			);
		}
	});

	/* ticket entrance + tilt + foil */
	gsap.from("#tk", {
		y: 120,
		opacity: 0,
		rotation: -3,
		duration: 1.6,
		ease: "expo.out",
		scrollTrigger: {
			trigger: "#tk",
			start: "top 88%",
			once: true,
		},
	});
	const tk = $("#tk");
	if (FINE) {
		tk.addEventListener("pointermove", (e) => {
			const r = tk.getBoundingClientRect(),
				x = (e.clientX - r.left) / r.width,
				y = (e.clientY - r.top) / r.height;
			tk.style.setProperty("--fx", x * 100 + "%");
			gsap.to(tk, {
				rotateY: (x - 0.5) * 9,
				rotateX: (0.5 - y) * 7,
				transformPerspective: 1400,
				duration: 0.6,
				overwrite: "auto",
			});
		});
		tk.addEventListener("pointerleave", () =>
			gsap.to(tk, {
				rotateX: 0,
				rotateY: 0,
				duration: 1,
				ease: "expo.out",
			}),
		);
	}

	/* footer */
	gsap.fromTo(
		"#b1",
		{ xPercent: -16 },
		{
			xPercent: 0,
			ease: "none",
			scrollTrigger: {
				trigger: "footer",
				scrub: true,
				start: "top bottom",
				end: "bottom bottom",
			},
		},
	);
	gsap.fromTo(
		"#b2",
		{ xPercent: 16 },
		{
			xPercent: 0,
			ease: "none",
			scrollTrigger: {
				trigger: "footer",
				scrub: true,
				start: "top bottom",
				end: "bottom bottom",
			},
		},
	);
})();
