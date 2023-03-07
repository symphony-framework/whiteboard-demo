## whiteboard demo app

Basic Features:
 - real-time collaboration
 - confict resolution with yjs
 - local persistence w/ indexDB

Potential Future Features:
 - erase tool
 - undo / redo

Bugs:
  - when attempting to scale multiple objects in a group, if the group is flipped on its Y or X axis, the group and subsequent operations on any objects in the group will diverge. This is becauase of the way that fabricjs handles grouping objects. Any transformations applied to a group are only applied to the group object, not the object themselves.
    - could fix by using groups to create objects to provide multi selection and transformation of objects with expected behavior
