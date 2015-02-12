QUnit.test("bone constructor without arguments", function( assert ) {
	var bone = new Bone();
    assert.propEqual(bone.startPos, $V([0,0,0]),"startPos not correct");
    assert.propEqual(bone.endPos, $V([bone.length, 0, 0]), "endPos not correct");
    assert.equal(bone.length, 30, "bone length not correct");
    assert.propEqual(bone.rotationAxis, $V([0, 0, 1]), "rotationAxis not correct");
});

QUnit.test("bone constructor with arguments", function( assert ) {
	var bone = new Bone(10,10,20);
    assert.propEqual(bone.startPos, $V([10,10,0]), "startPos not correct");
    assert.propEqual(bone.endPos, $V([20, 0, 0]), "endPos not correct");
    assert.equal(bone.length, 20, "bone length not correct");
    assert.propEqual(bone.rotationAxis, $V([0, 0, 1]),"rotationAxis not correct");
});

QUnit.test("connect bones", function( assert ) {
	var bone1 = new Bone(10,10,20);
    var bone2 = new Bone(10,10,20);
    bone1.connect(bone2);
    assert.propEqual(bone1.startPos.elements, [30,10,0], "connection failes");
});