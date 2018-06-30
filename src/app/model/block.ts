export interface Block {

  type: string;
  blockClass: string;
  configuration: {
    name: string,
    required: boolean,
    type: string,
    description: string
  };

  readHandles: {
    name: string,
    type: string,
    description: string
  };

  writeHandles: {
    name: string,
    type: string,
    description: string
  };

}
