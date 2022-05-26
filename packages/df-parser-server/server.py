import json

while True:
    try:
        msg = json.loads(input())
    except EOFError:
        break
    print(json.dumps({"msgId": msg["id"]}))
