import requests

tests = [
    {"city":"Bangalore","locality":"Koramangala","propertyType":"Apartment","area":1200,"bhk":3,"bathrooms":2,"age":5,"furnished":"Semi-Furnished","facing":"North-East","gatedSociety":True,"parking":True},
    {"city":"Mumbai","locality":"Bandra West","propertyType":"Penthouse","area":4500,"bhk":4,"bathrooms":5,"age":2,"furnished":"Fully Furnished","facing":"North","gatedSociety":True,"parking":True},
    {"city":"Jaipur","locality":"Vaishali Nagar","propertyType":"Villa","area":2800,"bhk":4,"bathrooms":4,"age":8,"furnished":"Unfurnished","facing":"East","gatedSociety":False,"parking":True},
    {"city":"New Delhi","locality":"Hauz Khas","propertyType":"Apartment","area":950,"bhk":2,"bathrooms":2,"age":12,"furnished":"Semi-Furnished","facing":"North","gatedSociety":True,"parking":False},
    {"city":"Hyderabad","locality":"Gachibowli","propertyType":"Apartment","area":1500,"bhk":3,"bathrooms":3,"age":3,"furnished":"Fully Furnished","facing":"East","gatedSociety":True,"parking":True},
]

print("\n=== PropIQ Live API Test ===\n")
all_ok = True
for t in tests:
    try:
        r = requests.post("http://127.0.0.1:8000/predict", json=t, timeout=30)
        if r.status_code == 200:
            d = r.json()
            price = d["estimatedPrice"]
            conf  = d["confidenceScore"]
            psf   = price // int(t["area"])
            ver   = d.get("modelVersion", "?")
            print("  PASS | {} {} {}sqft => Rs{:.1f}L | Conf:{}% | PSF:Rs{} | {}".format(
                t["city"], t["propertyType"], t["area"], price/1e5, conf, psf, ver))
        else:
            print("  FAIL | {} => HTTP {} | {}".format(t["city"], r.status_code, r.text[:120]))
            all_ok = False
    except Exception as e:
        print("  ERROR | {} => {}".format(t["city"], e))
        all_ok = False

print("\n" + ("ALL TESTS PASSED" if all_ok else "SOME TESTS FAILED"))
