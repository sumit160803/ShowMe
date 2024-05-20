from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
import random,time
import json
from .models import RoomMember
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

def getToken(request):
    appId = "585d0e7d00b74fcdb50315f9b7021a99"
    appCertificate = "cc440cd7e4a7415bb212dd627198d68c"
    channelName = request.GET.get("channel")
    uid = random.randint(1,230)
    expirationTimeInSeconds = 3600*24  #can set your own time wpphpp
    currentTimeStamp = int(time.time())
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1 #1 for host...2 for guest

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token,'uid':uid},safe=False)

def lobby(request):
    return render(request,"base/lobby.html")

def room(request):
    return render(request,"base/room.html")

@csrf_exempt
def createUser(request):
    data = json.loads(request.body)
    member,created = RoomMember.objects.get_or_create(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name'],
    )

    return JsonResponse({'name':data['name']},safe=False)

def getUser(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')

    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name,
    )
    name = member.name
    return JsonResponse({'name':member.name}, safe=False)

@csrf_exempt
def deleteUser(request):
    data = json.loads(request.body)
    member = RoomMember.objects.get(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    member.delete()
    return JsonResponse('Member deleted', safe=False)

