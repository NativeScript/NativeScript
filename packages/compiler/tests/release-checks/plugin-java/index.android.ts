// A plugin's source whose typings declaring com.example.peek are not with it.
export class Pager {
  transformer: com.example.peek.Peeker;

  peek(): number {
    this.transformer = new com.example.peek.Peeker();
    this.transformer.margin = 4;
    return com.example.peek.Peeker.twice(2);
  }
}
