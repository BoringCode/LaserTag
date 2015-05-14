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

/*void configureGun2(struct LaserGun *gun){
    strcpy(gun->team,teamid_s);
    strcpy(teamid_s,gun->team);
}*/

void get_time(char time_buffer[26]){
    time_t timer;
    struct tm* tm_info;
    //fprintf(stdout,"%u\n",(unsigned)time(NULL));
    time(&timer);
    tm_info = localtime(&timer);
    
    strftime(time_buffer,26,"%Y-%m-%d %H:%M:%S", tm_info);
}

void enter_game(int sock,char message[1000], struct LaserGun *gun){
    configureGun(gun);
    
    char time_buffer[26];
    get_time(time_buffer);
    char server_reply[2000];
    sprintf(message,"{\"id\":\"%s\",\"teamID\":\"%s\",\"time\":\"%s\"}",MAC_ADDR,teamid_s,time_buffer);
    printf("%s\n",message);
    if(send(sock,message,strlen(message),0)<0){
        perror("Send failed");
    }
    /*if( recv(sock , server_reply , 2000 , 0) < 0)
    { 
        puts("recv failed");
    }
    printf("Server says: %s\n",server_reply);
    */
    //sprintf(message,"{\"id\":\"%s\",\"time\":\"%s\"}\n",MAC_ADDR,time_buffer);
    memset(message,'0',1000);
}

void exit_game(int sock,char message[1000]){
    char time_buffer[26];
    get_time(time_buffer);
    printf("%s\n",message);
}

void shoot(int sock,char message[1000]){
    char time_buffer[26];
    get_time(time_buffer);
    // formatted for Server {id: "XX.XX.XXX.XXX",time:"XX:XX:XX"}
    sprintf(message,"{\"id\":\"%s\",\"teamID\":\"%s\",\"shot\":\"true\",\"time\":\"%s\"}",MAC_ADDR,teamid_s,time_buffer);
    printf("%s\n",message);
    if(send(sock,message,strlen(message),0)<0){
        perror("Send failed");
    }
    memset(message,'0',1000);
}

void hit(int sock,char message[1000],char SHOOTER_MAC[18],char oT[50]){
    char time_buffer[26];
    get_time(time_buffer);
    sprintf(message,"{\"id\":\"%s\",\"teamID\":\"%s\",\"opponentTeamID\":\"%s\",\"hitBy\":\"%s\",\"time\":\"%s\"}",MAC_ADDR,teamid_s,oT,SHOOTER_MAC,time_buffer);
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
    char message[1000] , server_reply[2000],PlayerID[18], SHOOT[1], SHOOTER_MAC[18], oT[50];
    // character arrays split from server
    int connected = 0;
    int shotCount = 0; // Number of shots accumulated
    int numbytes;
    struct LaserGun gun;
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
     
    printf("%s connected to %s:%d\n",MAC_ADDR,host,port);
    connected = CONNECTED;
    char time_buffer[26];
    get_time(time_buffer);
    printf("Enter user gun MAC ");
    
    sprintf(message,"{\"id\":\"%s\",\"-1\":\"%s\",\"time\":\"%s\"}",MAC_ADDR,T,time_buffer);
    
    printf("%s",message);
    if(send(sock,message,strlen(message),0)<0){
        perror("Send failed");
    }
 
    if (scanf("%s" , MAC_ADDR)!=1){
        fprintf(stderr, "Error when looking for Player MAC, too many strings inputted");
        return 1;
    }
    
    if((numbytes =  recv(sock , server_reply , 2000 , 0)) < 0)
    { 
        puts("recv failed");
        return 1;
    }
    printf("%s:%d reply : ",host,port);
    write(0,server_reply,numbytes);

    char server_reply2[] = "1231563688 1531234322 0 5 3"; 
    char * pch;
    int f = 0;
    pch = strtok(server_reply2, " ");
    while (pch != NULL){
        if (f==0){
            strcpy(gamestart_s, pch);
        }else if(f==1){
            strcpy(gameend_s, pch);
        }else if (f==2){
            strcpy(teamid_s, pch);
        }else if (f==3){
            strcpy(maxshots_s, pch);
        }else{
            strcpy(shotdelay_s, pch);
        }
        pch = strtok(NULL, " ");
        f++;
    }
    printf("Recieved: %s %s %s %s %s",gamestart_s,gameend_s,teamid_s,maxshots_s,shotdelay_s);
    
    //strcpy(gun->team,teamid_s);
    //strcpy(teamid_s,gun->team);
    //configureGun2(&gun);
    
    //keep communicating with server
    enter_game(sock,message,&gun);
    
    while( atoi(gamestart_s) > (unsigned)time(NULL));
    printf("start time: %d\n",atoi(gamestart_s));
    printf("current time: %d\n",(unsigned)time(NULL));
    printf("end time: %d\n",atoi(gameend_s));

    while(((unsigned)time(NULL) < (atoi(gameend_s)) ) ) 
    {


        printf("Enter message (1. Shoot 2. Hit 3. Exit) : ");
    
        if( (scanf("%s" , message) != 1) ) {
            fprintf(stderr, "Error doing scanf for 1");
            break;
        }
        
        
// Work on getting string compare with multiple things in a string
        if(!strcmp("1",message)){
            if(shotCount==atoi(maxshots_s)){
                printf("Invalid shot, you have reached max number of shots: %s", maxshots_s);
            }
            else{
                shotCount++;
                shoot(sock,message);
            }
        }
        else if(!strcmp("3",message)){
            exit_game(sock,message);
            printf("%s exiting\n", MAC_ADDR);
            break;
        }
        else{
            int n = sscanf(message,"%s,%s",SHOOT,SHOOTER_MAC);
            if(!strcmp("2",SHOOT)){
                
                //else{
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
            
                //}
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
