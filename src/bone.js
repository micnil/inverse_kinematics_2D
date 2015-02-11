var Bone = function (x, y, length){
    this.startPos = $V([x, y, 0]) || $V([0,0,0]);
    this.length = length || 30;
    this.endPos = $V([this.length, 0, 0]);
    //this.modelMatrix = Sylvester.Matrix.I(3);
    this.rotation = Sylvester.Matrix.I(3);
    this.rotationAxis = Sylvester.Vector.k;
};

Bone.prototype = {

    draw: function (context) { 

        /*this.startPos = this.modelMatrix.x(this.startPos);
        this.endPos = this.modelMatrix.x(this.endPos);*/
        
        context.save();

        context.fillStyle = "#0000FF";
        context.beginPath();
        context.moveTo(this.startPos.e(1), this.startPos.e(2));
        var globalEnd=this.getGlobalEndPos();
        context.lineTo(globalEnd.e(1), globalEnd.e(2));
        context.stroke();

        context.restore();
        
    },

    /** 
    * Translates the joint (this.startpoint) and endPoint to given coordinate (vec3)
    */
    translate: function (coords){
        
    },

    connect: function (bone){
        this.startPos=bone.getGlobalEndPos();
    },

    rotateLocally: function (rad){
        //rotation matrix
        var rotation = Sylvester.Matrix.Rotation(rad, this.rotationAxis);

        this.endPos = rotation.x(this.endPos);

    },

    getGlobalEndPos: function(){
        return this.startPos.add(this.endPos);
    }


};