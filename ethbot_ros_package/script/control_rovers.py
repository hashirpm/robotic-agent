#!/usr/bin/env python3

import rospy
import os
import requests
import json
from geometry_msgs.msg import Twist

API_BASE_URL = os.getenv("API_BASE_URL", "<SECRET KEY>")
NILLION_ORG_SECRET = os.getenv("NILLION_ORG_SECRET", "<SECRET KEY>")
NILLION_ORG_DID = os.getenv("NILLION_ORG_DID", "<SECRET KEY>")

def fetch_race_data():
    try:
        response = requests.post(
            f"{API_BASE_URL}/getLatestRaceLog",
            headers={
                "Content-Type": "application/json",
                "secretKey": NILLION_ORG_SECRET,
                "orgDid": NILLION_ORG_DID,
            },
            json={"raceId": "b"},
        )

        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                sensitive_data = json.loads(data["data"]["sensitiveData"])
                return sensitive_data  

    except Exception as e:
        rospy.logerr(f"Failed to fetch race data: {e}")

    return None 

# ROS control function
def control_rovers():
    rospy.init_node("multi_rover_control", anonymous=True)
    
    pub1 = rospy.Publisher("/robot1/cmd_vel1", Twist, queue_size=10)
    pub2 = rospy.Publisher("/robot2/cmd_vel2", Twist, queue_size=10)

    rate = rospy.Rate(10)  

    iteration = 0
    trap_triggered = False
    finish_line = 500  

    while not rospy.is_shutdown():
        race_data = fetch_race_data()
        if not race_data:
            rospy.logwarn("🚨 API fetch failed.")
            

        energy1 = race_data["robot1Energy"]
        energy2 = race_data["robot2Energy"]
        position1 = race_data["robot1Position"]
        position2 = race_data["robot2Position"]
        speed1 = race_data["robot1Speed"]
        speed2 = race_data["robot2Speed"]
        trap_robot = race_data["isrobot"]
        trap_effect = race_data["istrap"]
        
        if not trap_triggered:
            if trap_robot=="robot1":
                trap_effect = 10  
                energy2 = max(0, energy1 - trap_effect)  
                rospy.logwarn("🚨 Trap Activated! Robot 2 applied a trap. Robot 1 loses 10 energy.")
                trap_triggered = True 
            elif trap_robot=="robot2":
                trap_effect = 10  
                energy2 = max(0, energy1 - trap_effect)  
                rospy.logwarn("🚨 Trap Activated! Robot 1 applied a trap. Robot 2 loses 10 energy.")
                trap_triggered = True

        vel1 = Twist()
        vel1.linear.x = speed1
        vel1.angular.z = 0.0

        vel2 = Twist()
        vel2.linear.x = speed2
        vel2.angular.z = 0.0  

        pub1.publish(vel1)
        pub2.publish(vel2)

        if position1 >= finish_line:
            rospy.loginfo("🏆 Robot 1 Wins!")
            break
        elif position2 >= finish_line:
            rospy.loginfo("🏆 Robot 2 Wins!")
            break

        rospy.loginfo("🚗 Robot 1 -> Position: %d | Velocity: %.2f | Energy: %d%%", position1, speed1, energy1)
        rospy.loginfo("🚙 Robot 2 -> Position: %d | Velocity: %.2f | Energy: %d%%", position2, speed2, energy2)
        rospy.loginfo("_"*50)

        iteration += 1
        rate.sleep()

if __name__ == "__main__":
    try:
        control_rovers()
    except rospy.ROSInterruptException:
        pass
