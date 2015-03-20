/* 
2015 Dustin Waldron, Micah Russell, Bradley Rosenfeld

Second Client Program that keeps communication with Laser Tag Server
and interects based on user input
*/
#include<stdio.h> //printf
#include<string.h>    //strlen
#include<sys/socket.h>    //socket
#include<arpa/inet.h> //inet_addr

char* MAC_ADDR =  "AA:AA:AA:AA:AA:AA";

void shoot(int sock,char* message){
    message = malloc(sizeof(char)*1000);
    sprintf(message,"%s sent a shot",MAC_ADDR);
    puts(message);
    if(send(sock,message,strlen(message),0)<0){
        free(message);
        perror("Send failed");
    }
    free(message);
}

void hit(int sock,char* message){
    message = malloc(sizeof(char)*1000);
    sprintf(message,"%s got hit!",MAC_ADDR);
    puts(message);
    if(send(sock,message,strlen(message),0)<0){
        free(message);
        perror("Send failed");
    }
    free(message);
}

int main(int argc , char *argv[])
{
    int sock;
    char* host;
    int port;
    struct sockaddr_in server;
    char message[1000] , server_reply[2000];

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
     
    //keep communicating with server
    while(1)
    {
        printf("Enter message (1. Shoot 2. Hit 3. Exit) : ");
        scanf("%s" , message);

        if(!strcmp("1",message)){
            shoot(sock,message);
        }
        else if(!strcmp("2",message)){
            hit(sock,message);
        }
        else if(!strcmp("3",message)){
            printf("%s exiting\n", MAC_ADDR);
            break;
        }
        else{
            printf("%s said: %s\n",MAC_ADDR,message);
         
            //Send some data
            if( send(sock , message , strlen(message) , 0) < 0)
            {
                puts("Send failed");
                return 1;
            }
         
            //Receive a reply from the server
            if( recv(sock , server_reply , 2000 , 0) < 0)
            {
                puts("recv failed");
                break;
            }
         
            printf("%s:%d reply : %s\n",host,port,server_reply);
            //puts(server_reply);
        }
    }        
     
    close(sock);
    return 0;
}
