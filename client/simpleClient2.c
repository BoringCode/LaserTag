/* 
2015 Dustin Waldron, Micah Russell, Bradley Rosenfeld
Second Client Program that keeps communication with Laser Tag Server
and interects based on user input
*/
#include<stdio.h> //printf
#include<string.h>    //strlen
#include<sys/socket.h>    //socket
#include<arpa/inet.h> //inet_addr
#include <time.h>
#include <unistd.h>

#define CONNECTED 1;

struct LaserGun{
    char mac_address[18];
    char team[50];
};

// character arrasy for parsing string
char MAC_ADDR[18], T[50], gamestart_s[200], gameend_s[200], teamid_s[50], maxshots_s[10], shotdelay_s[10];


void configureGun(struct LaserGun *gun){
    printf("Configuring the Gun\n");

// INPUT MAC ADDRESS in MAIN

    strcpy(gun->mac_address,MAC_ADDR);
    strcpy(MAC_ADDR,gun->mac_address);
    strcpy(gun->team,teamid_s);
    strcpy(teamid_s,gun->team);
    printf("%s configured\n",gun->mac_address);
    printf("%s plays for %s\n", gun->mac_address,gun->team);
}

void enter_game(int sock,char message[1000], struct LaserGun *gun){
    configureGun(gun);
    
    char server_reply[2000];
    sprintf(message,"{\"id\":\"%s\",\"teamID\":\"%s\",\"time\":\"%d\"}",MAC_ADDR,teamid_s,(unsigned)time(NULL));
    printf("%s\n",message);
    if(send(sock,message,strlen(message),0)<0){
        perror("Send failed");
    }
    memset(message,'0',1000);
}


void shoot(int sock,char message[1000]){
    // formatted for Server {id: "XX.XX.XXX.XXX",time:"XX:XX:XX"}
    sprintf(message,"{\"id\":\"%s\",\"teamID\":\"%s\",\"shot\":\"true\",\"time\":\"%d\"}",MAC_ADDR,teamid_s,(unsigned)time(NULL));
    printf("%s\n",message);
    if(send(sock,message,strlen(message),0)<0){
        perror("Send failed");
    }
    memset(message,'0',1000);
}

void hit(int sock,char message[1000],char SHOOTER_MAC[18],char oT[50]){
    sprintf(message,"{\"id\":\"%s\",\"teamID\":\"%s\",\"opponentTeamID\":\"%s\",\"hitBy\":\"%s\",\"time\":\"%d\"}",MAC_ADDR,teamid_s,oT,SHOOTER_MAC,(unsigned)time(NULL));
    printf("%s\n",message);
    if(send(sock,message,strlen(message),0)<0){
        perror("Send failed");
    }
    memset(message,'0',1000);
}

int main(int argc , char *argv[])
{
    int sock;
    char* host;
    int port;
    struct sockaddr_in server;

// Initialized arrays for communication
    char message[1000] , server_reply[2000],PlayerID[18], SHOOT[1], SHOOTER_MAC[18], oT[50];
    int connected = 0;
    int shotCount = 0; // Number of shots accumulated
    int numbytes;
    struct LaserGun gun;

    unsigned int delayTime=0;
    //strcpy(MAC_ADDR, gun.mac_address); 

    if(argc != 3){
        printf("ussage: %s host port\n",argv[0]);
        return 1;
    }

    if(argv[1]){
        host = argv[1];
    }

    if(argv[2]){
        port = atoi(argv[2]);
    }

    //Create socket
    sock = socket(AF_INET , SOCK_STREAM , 0);
    if (sock == -1)
    {
        printf("Could not create socket\n");
    }
    puts("Socket created");
    
    server.sin_addr.s_addr = inet_addr(host);
    server.sin_family = AF_INET;
    server.sin_port = htons( port );
 
    //Connect to remote server
    if (connect(sock , (struct sockaddr *)&server , sizeof(server)) < 0)
    {
        perror("connect failed. Error");
        return 1;
    }
   
    // Input MAC address of user
    printf("Enter user gun MAC ");
    if (scanf("%s" , MAC_ADDR)!=1){
        fprintf(stderr, "Error when looking for Player MAC, too many strings inputted");
        return 1;
    } 

    // Connection completion
    printf("%s connected to %s:%d\n",MAC_ADDR,host,port);
    

    connected = CONNECTED;

    sprintf(message,"{\"id\":\"%s\",\"teamID\":\"-1\",\"time\":\"%d\"}",MAC_ADDR,(unsigned)time(NULL));
    
    printf("%s",message);

    if(send(sock,message,strlen(message),0)<0){
        perror("Send failed");
    }

    if((numbytes =  recv(sock , server_reply , 2000 , 0)) < 0){ 
        puts("recv failed");
        return 1;
    }
    printf("recieved: %s \n",server_reply);
    printf("%s:%d reply : \n",host,port);
    write(0,server_reply,numbytes);
    printf("\n\n");

    //char server_reply2[] = "1231563688 1531234322 0 5 3"; 
    char * pch;
    int f = 0;
    pch = strtok(server_reply, " ");
    while (pch != NULL){
        if (f==0){
            strcpy(gamestart_s, pch);
        }else if(f==1){
            strcpy(gameend_s, pch);
        }else if (f==2){
            strcpy(teamid_s, pch);
        }else if (f==3){
            strcpy(maxshots_s, pch);
        }else if (f==4){
            strcpy(shotdelay_s, pch);
        }
        pch = strtok(NULL, " ");
        f++;
    }
    printf("Recieved: \nStart time: %s\n End time: %s\n Team ID: %s\n Max Shots: %s\n Shot Delay: %s\n",gamestart_s,gameend_s,teamid_s,maxshots_s,shotdelay_s);
    

    //keep communicating with server
    enter_game(sock,message,&gun);
    int timee = (atoi(gamestart_s) - (unsigned)time(NULL))/60;
    while( atoi(gamestart_s) > (unsigned)time(NULL))
    {
        // CHECK FOR GAME START TIME
        if (timee > 5){
            printf("Game will start in %d min\n", timee);
            timee=0;
        }           
    }
    
    printf("start time: %d\n",atoi(gamestart_s));
    printf("current time: %d\n",(unsigned)time(NULL));
    printf("end time: %d\n",atoi(gameend_s));

    while(((unsigned)time(NULL) < (atoi(gameend_s)) ) ){


        printf("Enter message (1. Shoot 2. Hit 3. Exit) : ");
    
        if( (scanf("%s" , message) != 1) ) {
            fprintf(stderr, "Error doing scanf for 1");
            break;
        }
        
        
// Work on getting string compare with multiple things in a string
        if( !strcmp("1",message)/* && (atoi(maxshots_s) != shotCount )*/ ){
            shoot(sock,message);
        }
        else if(!strcmp("3",message)){
            printf("%s exiting\n", MAC_ADDR);
            break;
        }
        else{
            int n = sscanf(message,"%s,%s",SHOOT,SHOOTER_MAC);
            if(!strcmp("2",SHOOT)){
                
                    printf("Input shooter separated by space and shooter team ID (ex \"XX.XX.XX.XX 2\") ");
                    int i;
                    i = scanf("%s %s", SHOOTER_MAC, oT);
                    printf("%s",oT);
                    if ( i!=2){
                        printf("entered in: %d",i); 
                        fprintf(stderr, "Error when checking for shooter and shooter team ID");
                        break;
                    }
                
                    hit(sock,message,SHOOTER_MAC,oT);
            
            }
            else{
                printf("%s said: %s\n",MAC_ADDR,message);
         
                //Send some data
                if( send(sock , message , strlen(message) , 0) < 0)
                {
                    puts("Send failed");
                    return 1;
                }
            }
        }
        //Receive a reply from the server
        if((numbytes =  recv(sock , server_reply , 2000 , 0)) < 0)
        { 
            puts("recv failed");
            break;
        }
         
        printf("%s:%d reply : ",host,port);
        write(0,server_reply,numbytes);
        printf("\n");        
    }
    close(sock);
    return 0;
}
