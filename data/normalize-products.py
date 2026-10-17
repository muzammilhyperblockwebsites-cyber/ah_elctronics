#!/usr/bin/env python3
"""
Prime Electronics — Product Data Normalizer & Price Reconciler
Reads raw product JSON + PDF price list → outputs cleaned products.json + report
"""
import json, re, os, sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ASSETS_DIR = r"c:\Users\hp\Downloads\Prime_Electronics_Complete_Assets"
RAW_JSON = os.path.join(ASSETS_DIR, "all_products.json")
OUTPUT_JSON = os.path.join(PROJECT_DIR, "data", "products.json")
REPORT_FILE = os.path.join(PROJECT_DIR, "data", "price-reconciliation-report.md")

# ── Price List from PDF (extracted manually) ──────────────────
# Source: Sep-26 Proposed Price.pdf (Haier only)
PRICE_LIST = {
    # Refrigerators (Page 1)
    "HRF 216 EP": 63000, "HRF 246 EP": 69000, "HRF 276 EP": 74000,
    "HRF-316 EP": 83000, "HRF-346 EP": 87000, "HRF-246 IP": 73000,
    "HRF-276 IP": 78000, "HRF-316 IP": 87000, "HRF-346 IP": 91000,
    "HRF-418 IP": 104000, "HRF-458 IP": 109000, "HRF-538 IP": 117000,
    "HRF-316 ID": 93000, "HRF-346 ID": 97000, "HRF-418 ID": 109000,
    "HRF-458 ID": 114000, "HRF-538 ID": 124000, "HRF-316 IA+": 93000,
    "HRF-346 IA+": 97000, "HRF-418 IA+": 109000, "HRF-458 IA+": 114000,
    "HRF-538 IA+": 124000, "HRF-316 IF": 96000, "HRF-346 IF": 101000,
    "HRF-418 IF": 114000, "HRF-458 IF": 119000, "HRF-538 IF": 127000,
    "HRF-418 IF (IOT)": 119000, "HRF-458 IF (IOT)": 124000,
    "HRF-538 IF (IOT)": 131000, "HRF-622 IBS": 240000, "HRF-622 ICG": 250000,
    "HRF-622 IBG": 255000, "HRF-578 TSG/TBG": 210000,
    "HRF-578 TBG/TGG (IOT)": 214000, "HRF-678 TGG": 340000,
    "HRF-585SFFGU1": 360000,
    # Air Conditioners (Page 2)
    "Solar Hybrid-III(OW)-T3 Plus Wall Mount 1.5 Ton": 180000,
    "Solar Hybrid-IV(OW)-T3 Plus Wall Mount 2 Ton": 210000,
    "Solar Hybrid-IV FS(W)-T3 Plus Floor Standing 2 Ton": 298000,
    "HSU-10LFCM/013USDC(W)": 96000,
    "HSU-14HFTEX/013/023WUSDC(OW)-T3 Plus": 130000,
    "HSU-14HFTEX/013/023WUSDC(DG)-T3 Plus": 134000,
    "HSU-13HFAB/013/23WUSDC(W)-T3 Pro": 120000,
    "HSU-13HFAB/013/23WUSDC(Grey)-T3 Pro": 124000,
    "HSU-13HFS/013/23WDC(G)/(S)-T3 Pro": 124000,
    "HSU-13HFS/013/23WDC(W)-T3 Pro": 120000,
    "HSU-13HFN/013WDC(W)-T3": 118000,
    "HSU-13HFPA/013WUSDC(G-S-B,SG)": 112000,
    "HSU-13HFCS/CA/CP013/33/23USDC(W)-SG": 110000,
    "HSU-13LFCM/013/23DC(W)": 98000,
    "HSU-13LF-SUPREME/023DC(W)": 98000,
    "HSU-13LF-PRIME/023DC(W)": 98000,
    "HSU-12CFCP/023L(W)": 89000,
    "HSU-20HJ/013/23WUSDC(G)-T3 Plus": 230000,
    "HSU-20HJUV/013/23WUSDC(G)-T3 Plus": 208000,
    "HSU-20HFTEX/013/23/33WUSDC(OW)-T3 Plus": 165000,
    "HSU-20HFTEX/013/23/33WUSDC(DG)-T3 Plus": 170000,
    "HSU-19HFAB/013WUSDC(W)-T3 Pro": 148000,
    "HSU-19HFAB/013/23WUSDC(Grey)-T3 Pro": 153000,
    "HSU-19HFS/023WDC(S-G)-T3 Pro": 153000,
    "HSU-19HFS/023WDC(W)-T3 Pro": 148000,
    "HSU-19HFN/013WDC(W)-T3": 145000,
    "HSU-19HFPAA/013/23/43WUSDC(G,S,B)-SG": 137000,
    "HSU-19HFCS/CA/CP/013/23WDC(W)-SG": 125000,
    "HSU-19HUS/013WDC(W) Ultra Saver": 125000,
    "HSU-19LFCM/013/23USDC(W)": 126000,
    "HSU-19LF-SUPREME/023DC(W)": 126000,
    "HSU-19LF-PRIME/023DC(W)": 126000,
    "HSU-18CFCP/023L(W)": 114000,
    "HPU-24HJ/013WDC(G)-T3 Plus": 321000,
    "HPU-24HDZUV/013WDC(W) T3 Plus": 291000,
    "HPU-24HDZCA/013WDC(W) T3 Plus": 281000,
    "HPU-24HE/WSDC(X-IK)-T3": 260000,
    "HPU-24CE03/X-IK": 215000,
    "HSU-24HFAB/013WUSDC(W)-T3 Pro": 200000,
    "HSU-24HFAB/013WUSDC(Grey)-T3 Pro": 206000,
    "HSU-24HFCD/013/23WDC(W)": 194000,
    "HSU-24CFCM/023L(W)": 165000,
    # Washing Machines (Page 3)
    "HD 60 - 50": 18000, "HWS80-60 E:04": 19500, "HWS80-60": 20000,
    "HWS80-60 G:04": 20500, "HWM80-1217 E": 20000, "HWM 80-1217": 20500,
    "HWM 120-35FF": 26000, "HWM130-1217E": 26500, "HWM130-1217 WB": 27000,
    "HWM130-1217 GB": 27500, "HWM 75-AS": 26500, "HWM80-CS": 27500,
    "HTW100-196E": 33000, "HTW100-1217S": 33500, "HTW100-196S": 34000,
    "HTW 100-196G": 34500, "HWM120-AS (MG)": 47000, "HWM85-1269S6": 52000,
    "HWM100-1269S6": 54000, "HWM90-826E": 57000, "HWM100-826S6": 63000,
    "HWM100-316S6": 68000, "HWM100-316HS8": 69000, "HWM110-688S8": 70000,
    "HWM110-B688S8": 78000, "HWM120-826S6": 77000, "HWM120-316S6": 80000,
    "HWM130-688S8": 85000, "HWM130-B699S8": 96000, "HWM150-826S6": 85000,
    "HWM150-316S6": 90000, "HWM150-688S8": 94000, "HWM150-B699S8": 105000,
    "HW90-BP12357S8": 145000, "HW100-BP12357S8": 155000,
    "HW120-BP12357S8": 170000, "HWD120-BP12357S8": 210000,
    "HWD140-BPD14387GNU1": 250000,
    # Deep Freezers (Page 4)
    "HDF-285": 78500, "HDF-405": 98000, "HDF-545": 125500,
    "HDF-385": 93000, "HDF-245 Inverter": 80000, "HDF-285 Inverter": 83000,
    "HDF-405 Inverter": 103500, "HDF-465 Inverter": 107000,
    "HDF-545 Inverter": 133500, "HDF-230 Inverter": 65000,
    "HDF-320 Inverter": 75500, "HDF-385 Inverter": 98000,
    "HDF-535 Inverter": 118500, "HDF-175 Inverter Grey": 57000,
    "HDF-245 Inverter Grey": 80000, "HDF-285 Inverter Grey": 83000,
    "HDF-345 Inverter Grey": 89500, "HDF-405 Inverter Grey": 103500,
    "HDF-385 Inverter Grey": 98000,
    # LED TVs (Page 5)
    "H50S80 2K QLED": 87000, "H50K85": 100000, "H55K85": 116000,
    "H65K85": 187000, "H75K85": 237000, "H43S80": 90000, "H43S81": 90000,
    "H50S80": 107000, "H50S81": 107000, "H55S80": 126000, "H55S81": 126000,
    "H65S80": 195000, "H65S81": 195000, "H75S80": 271000, "H75S81": 271000,
    "H55M80": 165000, "H65M80": 225000, "H75M80": 305000, "H85M80": 480000,
    "H100S90": 835000,
    # Microwaves & Air Fryers (Page 6)
    "HAF50MB": 18500, "HAF50DB": 21500, "HMW-20MXP3": 14000,
    "HMW-20MPB": 14000, "HMW-20MPS": 14000, "HMW-20MX11": 16900,
    "HMW-20MX12": 17500, "HMW-20MHES": 16500, "HMW-20DSS": 18000,
    "HMW-25MXP9": 22500, "HMW-26MBH": 24000, "HMW-26MGH": 24000,
    "HMN-62MX80": 50000, "HMW-20DGS": 22000, "HMW-23200DG": 29000,
    "HMW-28100DG": 33000, "HMW-32300B": 35500, "HMW-32300S": 35500,
    "HMW-45DGM": 43500, "HGL-30100": 44500, "HMW-30AFR": 51500,
    "HMW-30AFS": 51500,
    # Kitchen Appliances (Page 7)
    "HCH-CT5907": 131500, "HCH-T3903S": 76000, "HCH-T3903": 65500,
    "HCH-T1903": 60500, "HCH-T1901": 55500, "HCH-9004TN": 50000,
    "HCH-9022GN": 39000, "HCH-7521GNA": 39000, "HCH-7521GN": 36000,
    "HCC-Q87388-N": 47000, "HCC-Q67358-N": 47000, "HCC-Q57328-N": 38500,
    "HCC-Q88396B-N": 71000, "HCC-Q88396-N": 60500, "HCC-Q67366-N": 47000,
    "HCC-Q67356-N": 47000, "HCC-Q57326-N": 38500, "HCC-6321DGG-N": 29600,
    "HCC-Q87388-L": 47000, "HCC-Q67358-L": 47000, "HCC-Q57328-L": 38500,
    "HCC-Q88396B-L": 71000, "HCC-Q88396-L": 60500, "HCC-Q67366-L": 47000,
    "HCC-Q67356-L": 47000, "HCC-Q57326-L": 38500, "HCC-6321DGG-L": 29600,
    "HOX-FP3AGB-PK": 128500, "HOX-FP3AGBX-PK": 128500,
    "HOX-P09HGB-PK": 116500, "HOX-P09HGBX-PK": 116500,
    "HMN-25NG24": 91000, "HMN-25NG23": 63000,
    # Water Dispensers (Page 8)
    "HDR-TC2C1GB-PK": 45000, "HDR-TC2C1GS-PK": 45000,
    "HDR-TC2C1GR-PK": 45000,
}


def normalize_model_key(model: str) -> str:
    """Normalize model string for matching: lowercase, strip spaces/hyphens/slashes."""
    s = model.strip().lower()
    s = re.sub(r'[\s\-_/()]+', '', s)
    s = re.sub(r'[^a-z0-9+]', '', s)
    return s


def build_price_index():
    """Build normalized price lookup from PRICE_LIST."""
    idx = {}
    for model, price in PRICE_LIST.items():
        key = normalize_model_key(model)
        idx[key] = (model, price)
    return idx


# ── Category normalization ────────────────────────────────────
CATEGORY_MAP = {
    "air conditioner": ("Air Conditioners", ""),
    "air conditioners": ("Air Conditioners", ""),
    "split air conditioners": ("Air Conditioners", "Split"),
    "inverter split ac": ("Air Conditioners", "Inverter Split"),
    "inverter floor standing ac": ("Air Conditioners", "Floor Standing"),
    "summer": ("Air Conditioners", ""),
    "refrigerator": ("Refrigerators", ""),
    "refrigerators": ("Refrigerators", ""),
    "refrigerators and freezers": ("Refrigerators", ""),
    "double door refrigerator": ("Refrigerators", "Double Door"),
    "single door refrigerator": ("Refrigerators", "Single Door"),
    "multi door refrigerator": ("Refrigerators", "Multi Door"),
    "no frost refrigerator": ("Refrigerators", "No Frost"),
    "deep freezer": ("Deep Freezers", ""),
    "single door freezer": ("Deep Freezers", "Single Door"),
    "twin door freezer": ("Deep Freezers", "Twin Door"),
    "vertical freezer": ("Deep Freezers", "Vertical"),
    "no frost vertical freezer": ("Deep Freezers", "No Frost Vertical"),
    "led tv": ("LED TVs", ""),
    "led tvs": ("LED TVs", ""),
    "tvs": ("LED TVs", ""),
    "skyworth tvs": ("LED TVs", "Skyworth"),
    "hd tv": ("LED TVs", "HD"),
    "2k fhd": ("LED TVs", "2K FHD"),
    "2k hd": ("LED TVs", "2K HD"),
    "4k uhd": ("LED TVs", "4K UHD"),
    "washing machine": ("Washing Machines", ""),
    "washing machines": ("Washing Machines", ""),
    "front load washing machine": ("Washing Machines", "Front Load"),
    "top load washing machine": ("Washing Machines", "Top Load"),
    "twin tub washing machine": ("Washing Machines", "Twin Tub"),
    "single tub washer": ("Washing Machines", "Single Tub"),
    "spinner dryer": ("Washing Machines", "Spinner Dryer"),
    "water dispenser": ("Water Dispensers", ""),
    "water dispensers": ("Water Dispensers", ""),
    "bottom load water dispensers": ("Water Dispensers", "Bottom Load"),
    "with refrigerator": ("Water Dispensers", "With Refrigerator"),
    "without refrigerator": ("Water Dispensers", "Without Refrigerator"),
    "domestic water cooler": ("Water Dispensers", "Domestic Cooler"),
    "industrial water cooler": ("Water Dispensers", "Industrial Cooler"),
    "wintry mix": ("Water Dispensers", "Water Heater"),
    "microwave oven & air fryer": ("Microwave Ovens & Air Fryers", ""),
    "microwave ovens": ("Microwave Ovens & Air Fryers", ""),
    "air fryer microwave oven": ("Microwave Ovens & Air Fryers", "Air Fryer"),
    "baking microwave oven": ("Microwave Ovens & Air Fryers", "Baking"),
    "grilling microwave oven": ("Microwave Ovens & Air Fryers", "Grill"),
    "heating microwave oven": ("Microwave Ovens & Air Fryers", "Heating"),
    "built in microwave oven": ("Microwave Ovens & Air Fryers", "Built-In"),
    "kitchen appliance": ("Kitchen & Small Appliances", ""),
    "kitchen appliances": ("Kitchen & Small Appliances", ""),
    "cooking appliances": ("Kitchen & Small Appliances", "Cooking Appliances"),
    "home appliances": ("Kitchen & Small Appliances", ""),
    "air fryer": ("Kitchen & Small Appliances", "Air Fryer"),
    "blender": ("Kitchen & Small Appliances", "Blender"),
    "built in hob": ("Kitchen & Small Appliances", "Built-In Hob"),
    "built in hood": ("Kitchen & Small Appliances", "Built-In Hood"),
    "built in oven": ("Kitchen & Small Appliances", "Built-In Oven"),
    "coffee machines": ("Kitchen & Small Appliances", "Coffee Machine"),
    "electric kettle": ("Kitchen & Small Appliances", "Kettle"),
    "food processor": ("Kitchen & Small Appliances", "Food Processor"),
    "hot plate": ("Kitchen & Small Appliances", "Hot Plate"),
    "juicer": ("Kitchen & Small Appliances", "Juicer"),
    "meat mincer": ("Kitchen & Small Appliances", "Meat Mincer"),
    "mini oven": ("Kitchen & Small Appliances", "Mini Oven"),
    "multi cooker": ("Kitchen & Small Appliances", "Multi Cooker"),
    "sandwich maker": ("Kitchen & Small Appliances", "Sandwich Maker"),
    "toaster": ("Kitchen & Small Appliances", "Toaster"),
    "dishwasher": ("Kitchen & Small Appliances", "Dishwasher"),
    "inverter dishwasher": ("Kitchen & Small Appliances", "Dishwasher"),
    "dry iron": ("Kitchen & Small Appliances", "Iron"),
    "steam iron": ("Kitchen & Small Appliances", "Iron"),
    "garment steamer": ("Kitchen & Small Appliances", "Garment Steamer"),
    "vacuum cleaner": ("Kitchen & Small Appliances", "Vacuum Cleaner"),
    "hair dryer": ("Kitchen & Small Appliances", "Hair Dryer"),
    "hair straightener": ("Kitchen & Small Appliances", "Hair Straightener"),
    "grooming kit": ("Kitchen & Small Appliances", "Grooming"),
    "shaver": ("Kitchen & Small Appliances", "Grooming"),
    "trimmer": ("Kitchen & Small Appliances", "Grooming"),
    "motorcycles": ("Motorcycles", ""),
    "ev": ("Motorcycles", "Electric"),
    "spare parts": ("Spare Parts & Accessories", ""),
    "all products": ("Kitchen & Small Appliances", ""),
    "missing category": ("Kitchen & Small Appliances", ""),
}


def refine_category(name, category, subcategory):
    """Dump categories such as All Products were stored as kitchen appliances.
    Re-home products whose names clearly belong to another catalog category.
    Range hood model codes that contain TV stay in kitchen."""
    if category != "Kitchen & Small Appliances":
        return category, subcategory
    n = name.lower()
    if re.search(r"hood|htv|cnk-", n):
        return category, subcategory
    if re.search(r"\b(4k|uhd|smart tv|led tv)\b", n) or re.search(r"(?<![a-z])tv\b", n):
        sub = "4K UHD" if re.search(r"4k|uhd", n) else ""
        return "LED TVs", sub
    if "water dispenser" in n or "water cooler" in n:
        return "Water Dispensers", ""
    if "microwave" in n:
        sub = "Built-In" if "built" in n else ""
        return "Microwave Ovens & Air Fryers", sub
    return category, subcategory


def normalize_brand(brand_str, company_str):
    b = (brand_str or "").lower().strip()
    c = (company_str or "").lower().strip()
    if "haier" in b or "haier" in c: return "Haier"
    if "dawlance" in b or "dawlance" in c: return "Dawlance"
    if "orient" in b or "orient" in c: return "Orient"
    if "canon" in b or "canon" in c: return "Canon"
    if "atlas" in b or "honda" in b or "atlas" in c or "honda" in c: return "Atlas Honda"
    return brand_str or company_str or "Unknown"


def generate_slug(text):
    s = text.lower().strip()
    s = re.sub(r'[–—]', '-', s)
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s)
    s = re.sub(r'-+', '-', s)
    s = s.strip('-')
    return s[:120]


def extract_model(raw):
    """Extract the best model identifier from raw product data."""
    if raw.get("model"):
        return raw["model"].strip()
    if raw.get("sku"):
        # Clean SKU: replace hyphens, uppercase
        sku = raw["sku"].strip()
        return sku
    if raw.get("handle"):
        return raw["handle"].strip()
    if raw.get("slug"):
        return raw["slug"].strip()
    return raw.get("name", "").strip()


def extract_specs(raw):
    """Extract specifications as a clean dict."""
    specs = raw.get("specs", {})
    if not isinstance(specs, dict):
        return {}
    # Try to parse concatenated spec strings into individual key-value pairs
    result = {}
    for section, text in specs.items():
        if not isinstance(text, str):
            continue
        # Clean section name
        clean_section = section.replace("Festures", "Features")
        result[clean_section] = text.strip()
    return result


def process_products():
    """Main processing pipeline."""
    print("Loading raw product data...")
    with open(RAW_JSON, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    raw_products = raw_data["products"]
    print(f"Loaded {len(raw_products)} raw products")

    # Build price index
    price_idx = build_price_index()
    print(f"Price list entries: {len(PRICE_LIST)}")

    products = []
    report = {
        "total": 0,
        "by_brand": {},
        "by_category": {},
        "price_list_matched": 0,
        "json_priced": 0,
        "contact_for_price": 0,
        "missing_images": 0,
        "missing_models": 0,
        "ambiguous_matches": [],
        "unmatched_pricelist": list(PRICE_LIST.keys()),
        "duplicates": [],
        "invalid_images": 0,
    }

    seen_slugs = set()
    seen_models = {}

    for idx, raw in enumerate(raw_products):
        company = raw.get("company", "")
        brand = normalize_brand(raw.get("brand", ""), company)
        model = extract_model(raw)
        name = raw.get("name", "").strip()
        
        # Clean name: remove unicode artifacts
        name = name.replace("�", " — ").replace("\u00e2\u0080\u0093", " — ")
        name = re.sub(r'\s+', ' ', name).strip()

        # Category normalization
        raw_cat = raw.get("category", "").strip()
        cat_key = raw_cat.lower().strip()
        if cat_key in CATEGORY_MAP:
            category, subcategory = CATEGORY_MAP[cat_key]
        else:
            category, subcategory = "Kitchen & Small Appliances", ""
        category, subcategory = refine_category(name, category, subcategory)

        # Series
        series = raw.get("series", "") or raw.get("model_series", "") or ""

        # Price reconciliation
        price = None
        price_source = "none"

        # 1. Try price-list match (Haier only — the PDF is Haier)
        if brand == "Haier" and model:
            model_key = normalize_model_key(model)
            if model_key in price_idx:
                matched_model, matched_price = price_idx[model_key]
                price = matched_price
                price_source = "price-list"
                # Remove from unmatched
                if matched_model in report["unmatched_pricelist"]:
                    report["unmatched_pricelist"].remove(matched_model)

        # 2. Fall back to JSON price
        if price is None:
            json_price = raw.get("price_pkr")
            if json_price and isinstance(json_price, (int, float)) and json_price > 0:
                price = int(json_price)
                price_source = "json"

        # Images
        main_image = raw.get("image_main", "")
        gallery = raw.get("image_gallery", [])
        if not isinstance(gallery, list):
            gallery = []
        # Filter out marketing/banner images from Orient
        gallery = [img for img in gallery if isinstance(img, str) and img.startswith("http")]

        # Slug
        slug = raw.get("slug") or raw.get("handle") or generate_slug(name)
        slug = generate_slug(slug) if slug else generate_slug(name)
        
        # Ensure unique slug
        base_slug = slug
        counter = 1
        while slug in seen_slugs:
            slug = f"{base_slug}-{counter}"
            counter += 1
        seen_slugs.add(slug)

        # Check for duplicate models
        if model:
            model_lower = model.lower().strip()
            if model_lower in seen_models:
                report["duplicates"].append({
                    "model": model,
                    "product1": seen_models[model_lower],
                    "product2": name,
                })
            else:
                seen_models[model_lower] = name

        # Specs
        specs = extract_specs(raw)

        # Short description
        short_desc = raw.get("description", "") or ""
        if len(short_desc) > 300:
            short_desc = short_desc[:297] + "..."

        # Warranty (extract from specs if available)
        warranty = ""
        if "Warranty" in specs:
            warranty = specs["Warranty"]

        # Availability — not in data, default to "Check on WhatsApp"
        availability = "Check Availability"

        # Featured: products with images + price from first categories
        featured = bool(main_image and price and category in [
            "Refrigerators", "Air Conditioners", "Washing Machines", "LED TVs"
        ] and idx < 200)

        # Special offer: only if old_price exists in original JSON
        special_offer = False

        product = {
            "id": idx + 1,
            "slug": slug,
            "name": name,
            "brand": brand,
            "model": model,
            "category": category,
            "subcategory": subcategory,
            "series": series,
            "price": price,
            "priceSource": price_source,
            "mainImage": main_image,
            "gallery": gallery,
            "specifications": specs,
            "shortDescription": short_desc,
            "warranty": warranty,
            "availability": availability,
            "featured": featured,
            "specialOffer": special_offer,
            "sourceUrl": raw.get("url", ""),
        }
        products.append(product)

        # Report stats
        report["total"] += 1
        report["by_brand"][brand] = report["by_brand"].get(brand, 0) + 1
        report["by_category"][category] = report["by_category"].get(category, 0) + 1
        if price_source == "price-list":
            report["price_list_matched"] += 1
        elif price_source == "json":
            report["json_priced"] += 1
        else:
            report["contact_for_price"] += 1
        if not main_image:
            report["missing_images"] += 1
        if not model:
            report["missing_models"] += 1

    # Write products
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {len(products)} products to {OUTPUT_JSON}")

    # Write report
    write_report(report, len(products))
    print(f"Wrote report to {REPORT_FILE}")

    return products, report


def write_report(report, total):
    lines = [
        "# Prime Electronics — Data Integrity & Price Reconciliation Report\n",
        f"**Generated**: September 2026\n",
        f"## Summary\n",
        f"- **Total products imported**: {report['total']}",
        f"- **Products with price-list matched prices**: {report['price_list_matched']}",
        f"- **Products using JSON prices**: {report['json_priced']}",
        f"- **Products showing 'Contact for Price'**: {report['contact_for_price']}",
        f"- **Products with missing images**: {report['missing_images']}",
        f"- **Products with missing models**: {report['missing_models']}",
        f"- **Duplicate models found**: {len(report['duplicates'])}",
        "",
        "## Products by Brand\n",
        "| Brand | Count |",
        "| --- | --- |",
    ]
    for brand, count in sorted(report["by_brand"].items()):
        lines.append(f"| {brand} | {count} |")

    lines.extend([
        "",
        "## Products by Normalized Category\n",
        "| Category | Count |",
        "| --- | --- |",
    ])
    for cat, count in sorted(report["by_category"].items()):
        lines.append(f"| {cat} | {count} |")

    if report["unmatched_pricelist"]:
        lines.extend([
            "",
            f"## Unmatched Price-List Entries ({len(report['unmatched_pricelist'])})\n",
            "These models appear in the Sep-26 Proposed Price PDF but were not matched to any product in the JSON:\n",
        ])
        for model in sorted(report["unmatched_pricelist"]):
            price = PRICE_LIST.get(model, "?")
            lines.append(f"- `{model}` — PKR {price:,}")

    if report["duplicates"]:
        lines.extend([
            "",
            f"## Duplicate Models ({len(report['duplicates'])})\n",
        ])
        for dup in report["duplicates"]:
            lines.append(f"- Model `{dup['model']}`: \"{dup['product1']}\" / \"{dup['product2']}\"")

    lines.extend([
        "",
        "## Price Source Priority\n",
        "1. **Price-list document** (Sep-26 Proposed Price PDF) — Haier models only",
        "2. **JSON product data** (all_products.json) — Canon, Atlas Honda, and some Haier products",
        "3. **Contact for Price** — Dawlance, Orient, and products without valid prices",
        "",
        "## Notes\n",
        "- The price-list PDF contains only Haier product prices.",
        "- Dawlance (383 products) and Orient (233 products) have no prices in any source.",
        "- All Canon (233) and Atlas Honda (42) products have JSON-supplied prices.",
        "- Price matching uses normalized model keys (lowercased, stripped of spaces/hyphens/special chars).",
        "- No prices were guessed or assigned from similar models.",
    ])

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    products, report = process_products()
    print("\n=== Processing Complete ===")
    print(f"Total: {report['total']}")
    print(f"Price-list matched: {report['price_list_matched']}")
    print(f"JSON priced: {report['json_priced']}")
    print(f"Contact for Price: {report['contact_for_price']}")
    print(f"Missing images: {report['missing_images']}")
    print(f"Unmatched price-list entries: {len(report['unmatched_pricelist'])}")
